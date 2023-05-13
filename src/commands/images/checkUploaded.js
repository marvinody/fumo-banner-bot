const { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, Client, EmbedBuilder, AttachmentBuilder } = require('discord.js');

const { ALLOWED_DECODERS, ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE_IN_MB } = require('../../constants')
const { is16by9AR } = require('../../utilities/imageSizeChecker')
const { UserFixableAction, WrongFileType, ImageWrongAspectRatio, ImageFilesizeTooLarge } = require('../../utilities/errors')
const { findExistingPicsByUser } = require('../../db');
const { pipeline } = require('../../utilities/imagePipeline');
const config = require('../../config');
const path = require('path')


module.exports = {
  data: new SlashCommandBuilder()
    .setName('see')
    .setDescription('See pics uploaded by someone')
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
            .setRequired(true))
        
        )
        
    .setDefaultMemberPermissions(PermissionFlagsBits.EmbedLinks)
    .setDMPermission(false),

  /**
    * @param {ChatInputCommandInteraction} interaction
    * @param {Client<boolean>} bot
 */
  async execute(interaction, bot) {

    const subcommand = interaction.options.getSubcommand();
    let user = interaction.user;

    if(subcommand === 'other') {
      user = interaction.options.getMentionable('person');
    }
    const userId = user.id;

    await interaction.deferReply({
      ephemeral: true,
    })

    const picRows = await findExistingPicsByUser(bot.db, userId)

    if(picRows.length === 0) {
      return interaction.editReply({
        content: "User does not have any images for the banner rotation."
      })
    }

    const imagePaths = picRows
      .map(row => row.filename)
      .map(filename => path.join(config.imagePath, filename))
    
    const attachments = imagePaths.map((imagepath, idx) => {
      const attachment = new AttachmentBuilder(imagepath, {
        name: `image-${idx}.png`
      });
      return attachment;
    })

    const footer = picRows.length === 1 ? "1 image" : `${picRows.length} images (click one to see more)`;


    const embeds = imagePaths.map((imagepath, idx) => {
      const embedBuilder = new EmbedBuilder();
      embedBuilder
      .setTitle(`Images for ${user.username}`)
      .setURL('https://discord.gg/fumofumo')
      .setFooter({
        text: footer
      })
      .setImage(`attachment://image-${idx}.png`);

      return embedBuilder;
    })

    return interaction.editReply({
      files: attachments,
      embeds,
      ephemeral: true,
    });

  },
};
