const { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, userMention } = require('discord.js');
const { ALLOWED_DECODERS, ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE_IN_MB } = require('../../constants')
const { is16by9AR } = require('../../utilities/imageSizeChecker')
const { UserFixableAction, WrongFileType, ImageWrongAspectRatio, ImageFilesizeTooLarge } = require('../../utilities/errors')
const { getXMostRecentBanners, getPicById } = require('../../db')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('current-banner')
    .setDescription('Find out who\'s pic is the current banner')
    .setDefaultMemberPermissions(PermissionFlagsBits.AttachFiles)
    .setDMPermission(false),

  /**
   * @param {ChatInputCommandInteraction} interaction
   * @param {Eris.Client} bot
  */
  async execute(interaction, bot) {

    await interaction.deferReply({
      ephemeral: true,
    })

    const bannerRows = await getXMostRecentBanners(bot.db, 1);
    const currentBanner = bannerRows[0];

    const imageRow = await getPicById(bot.db, currentBanner.image_id);

    return interaction.editReply({
      content: `The current banner on rotation was submitted by ${userMention(imageRow.user_id)}`,
      ephemeral: true,
    })

  },
};
