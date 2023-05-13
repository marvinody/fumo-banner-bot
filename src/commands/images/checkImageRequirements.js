const { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits } = require('discord.js');
const { ALLOWED_DECODERS, ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE_IN_MB } = require('../../constants')
const { is16by9AR } = require('../../utilities/imageSizeChecker')
const { UserFixableAction, WrongFileType, ImageWrongAspectRatio, ImageFilesizeTooLarge } = require('../../utilities/errors')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('check-banner-image')
    .setDescription('Check if an image is a valid banner to upload')
    .addAttachmentOption(option =>
      option
        .setName('image')
        .setDescription('Image to check (jpg/png)')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.AttachFiles)
    .setDMPermission(false),

  /**
   * @param {ChatInputCommandInteraction} interaction
   * @param {Eris.Client} bot
  */
  async execute(interaction) {

    const img = interaction.options.getAttachment('image');

    try {

      if (!ALLOWED_IMAGE_TYPES.includes(img.contentType)) {
        throw new WrongFileType();
      }

      const sizeInMB = img.size / 1000 / 1000;
      if (sizeInMB > MAX_FILE_SIZE_IN_MB) {
        throw new ImageFilesizeTooLarge();
      }

      const width = img.width;
      const height = img.height;

      if (!is16by9AR(width, height)) {
        throw new ImageWrongAspectRatio();
      }

      return interaction.reply({
        content: 'Your image fits the requirements. Upload to the correct channel and wait for a mod.',
        ephemeral: true,
      })

    } catch (err) {
      if (err instanceof UserFixableAction) {
        return interaction.reply({
          content: err.message,
          ephemeral: true,
        })
      }
    }
  },
};
