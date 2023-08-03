const { SlashCommandBuilder, User, ChatInputCommandInteraction, PermissionFlagsBits, Client, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const _ = require('lodash');

const { ALLOWED_DECODERS, ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE_IN_MB, SETTINGS } = require('../../constants')
const { is16by9AR } = require('../../utilities/imageSizeChecker')
const { UserFixableAction, WrongFileType, ImageWrongAspectRatio, ImageFilesizeTooLarge } = require('../../utilities/errors')
const { findExistingPicsByUser, getAllPics, findAllPicsByUser } = require('../../db');
const { pipeline } = require('../../utilities/imagePipeline');
const config = require('../../config');
const path = require('path')


module.exports = {
  data: new SlashCommandBuilder()
    .setName('stats')
    .setDescription('See stats relating someone')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('self')
        .setDescription('See your own pics in rotation currently'))
    .addSubcommand((subcommand) =>
      subcommand
        .setName('other')
        .setDescription('See another\'s pics in rotation currently')
        .addMentionableOption(option =>
          option
            .setName('person')
            .setDescription('Person to search for (this won\'t ping them)')
            .setRequired(true)))
    .addSubcommand((subcommand) =>
      subcommand
        .setName('all')
        .setDescription('Lookup geeneral stats for all images'))

    .setDefaultMemberPermissions(PermissionFlagsBits.EmbedLinks)
    .setDMPermission(false),


  /**
  * @param {ChatInputCommandInteraction} interaction
  * @param {Client<boolean>} bot
  */
  async allStats(interaction, bot) {

    const images = await getAllPics(bot.db);

    const totalImages = _.size(images);
    const totalRotations = _.sumBy(images, 'times_posted');
    const enabledImagesCount = _(images).filter(['enabled', 1]).size();
    const disabledImagesCount = _(images).filter(['enabled', 0]).size();
    const sortedImages = _(images).sortBy('times_posted');
    const lowestPostCount = _(images).map('times_posted').min();
    const highestPostCount = _(images).map('times_posted').max();

    const CUTOFF_PERCENT = .10;
    const trimmedImages = sortedImages.slice(totalImages * CUTOFF_PERCENT, totalImages * (1 - CUTOFF_PERCENT)).value();
    const trimmedImagesCount = _(trimmedImages).size();
    const trimmedTotalRotations = _.sumBy(trimmedImages, 'times_posted');
    const trimmedLowestPostCount = _(trimmedImages).map('times_posted').min();
    const trimmedHighestPostCount = _(trimmedImages).map('times_posted').max();

    const groupedByUser = _(sortedImages).groupBy('user_id').map((imagesForUser, userId) => {
      return {
        userId,
        totalRotations: _.sumBy(imagesForUser, 'times_posted'),
      }
    }).value()

    const userWithMostImages = _(groupedByUser).maxBy('totalRotations');
    const memberWithMostImages = await interaction.guild.members.fetch(userWithMostImages.userId);

    const lines = [
      { name: "Total Images", value: totalImages.toString(), inline: true },
      { name: "Total Images [Trimmed]", value: trimmedImagesCount.toString(), inline: true },
      { name: "Total Rotations", value: totalRotations.toString(), inline: true },
      { name: "Total Rotations [Trimmed]", value: trimmedTotalRotations.toString(), inline: true },
      { name: "Enabled Images", value: enabledImagesCount.toString(), inline: true },
      { name: "Disabled Images", value: disabledImagesCount.toString(), inline: true },
      { name: "Lowest Single Post Count", value: lowestPostCount.toString(), inline: true },
      { name: "Lowest Single Post Count [Trimmed]", value: trimmedLowestPostCount.toString(), inline: true },
      { name: "Highest Single Post Count", value: highestPostCount.toString(), inline: true },
      { name: "Highest Single Post Count [Trimmed]", value: trimmedHighestPostCount.toString(), inline: true },
      { name: "Highest Combined User Rotations", value: `@${memberWithMostImages.displayName} (${userWithMostImages.totalRotations} times posted)`, inline: true },
    ];

    const embed = new EmbedBuilder()
      .setTitle('General Stats')
      .setDescription(`Statistics for the Banner bot. Anytime you see trimmed that means that the top 10% and the bottom 10% is cut off. This is just a quick way to remove outliers and have more averaged data and lets you see how the high and low reflect in the outliers.`)
      .addFields(...lines)

    return interaction.editReply({
      embeds: [embed.toJSON()]
    });
  },

  /**
  * @param {ChatInputCommandInteraction} interaction
  * @param {Client<boolean>} bot
  * @param {User} user
  */
  async statsForUser(interaction, bot, user) {
    const picsByUser = await findAllPicsByUser(bot.db, user.id);
    const shouldDMUser = bot[SETTINGS.DM_PREF].has(user.id);

    const lines = [
      { name: "Notification DM Setting", value: shouldDMUser ? "Enabled" : "Disabled" },
      ..._(picsByUser).map(r => ({
        name: `${r.filename}`,
        value: r.times_posted.toString(),
        inline: true,
      }))
    ];

    const embed = new EmbedBuilder()
      .setTitle('User Specific Stats')
      .setDescription(`Statistics for the Banner bot. Filenames are based on how the server saved them and may be meaningless to you. Just look at the overall trends`)
      .addFields(...lines)

    return interaction.editReply({
      embeds: [embed.toJSON()]
    });

  },

  /**
  * @param {ChatInputCommandInteraction} interaction
  * @param {Client<boolean>} bot
  */
  async execute(interaction, bot) {

    await interaction.deferReply({
      ephemeral: true,
    });

    const subcommand = interaction.options.getSubcommand();

    if(subcommand === 'all') {
      return this.allStats(interaction, bot)
    } else if (subcommand === 'other') {
      const user = interaction.options.getMentionable('person');
      this.statsForUser(interaction, bot, user)
    } else {
      this.statsForUser(interaction, bot, interaction.user)
    }
  },
};
