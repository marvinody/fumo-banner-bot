const { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, Client } = require('discord.js');

const { ALLOWED_DECODERS, ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE_IN_MB, MAX_ENABLED_PER_USER } = require('../../constants')
const { is16by9AR } = require('../../utilities/imageSizeChecker')
const { UserFixableAction, WrongFileType, ImageWrongAspectRatio, ImageFilesizeTooLarge } = require('../../utilities/errors')
const { addNewPic, getAllEnabledPics, findExistingPicsByUser } = require('../../db');
const { pipeline } = require('../../utilities/imagePipeline');
const config = require('../../config');



module.exports = {
  data: new SlashCommandBuilder()
    .setName('upload')
    .setDescription('Uploads a file to the bot')
    .addMentionableOption(option =>
      option
        .setName('author')
        .setDescription('Author of the image')
        .setRequired(true))
    .addAttachmentOption(option =>
      option
        .setName('image')
        .setDescription('Image to upload')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setDMPermission(false),

  /**
    * @param {ChatInputCommandInteraction} interaction
    * @param {Client<boolean>} bot
 */
  async execute(interaction, bot) {

    const img = interaction.options.getAttachment('image');
    const user = interaction.options.getMember('author');

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

      await interaction.deferReply({
        ephemeral: true
      })
      const filename = `${img.id}.${config.outputImageType}`

      await pipeline(img.url, filename)

      const picsEnabled = await findExistingPicsByUser(bot.db, user.id);
      const shouldNewBeEnabled = picsEnabled.length < MAX_ENABLED_PER_USER

      await addNewPic(bot.db, filename, user.id, shouldNewBeEnabled)

      const extendedStr = `user has ${(picsEnabled).length} enabled, so this has been set to "${shouldNewBeEnabled ? 'enabled' : 'disabled'}"`
      await interaction.editReply(`Image "${img.name}" downloaded as ${filename} (${extendedStr})`);

    } catch (err) {
      if (err instanceof UserFixableAction) {
        return interaction.reply({
          content: err.message,
          ephemeral: true,
        })
      }
      console.error(err);
      return interaction.reply({
        content: 'Unexpected error...please try again later.'
      })
    }
  },
};
