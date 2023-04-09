const { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits } = require('discord.js');
const { downloadImage } = require("../../utilities/downloadImage");

const ALLOWED_TYPES = [
  'image/png'
]

const REQUIRED_WIDTH = 960
const REQUIRED_HEIGHT = 540

module.exports = {
  data: new SlashCommandBuilder()
    .setName('download')
    .setDescription('Uploads a file to the bot')
    .addAttachmentOption(option =>
      option
        .setName('image')
        .setDescription('Image to download')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setDMPermission(false),

  /**
 * @param {Eris.Client} bot
 * @param {ChatInputCommandInteraction} interaction
 */
  async execute(interaction) {
    const img = interaction.options.getAttachment('image');

    if (!ALLOWED_TYPES.includes(img.contentType)) {
      return interaction.reply({
        content: `${img.name} must be PNG`,
        ephemeral: true,
      })
    }

    const width = img.width;
    const height = img.height;
  
    if(width !== REQUIRED_WIDTH || height !== REQUIRED_HEIGHT) {
      return interaction.reply({
        content: `Image MUST be ${REQUIRED_WIDTH}x${REQUIRED_HEIGHT}`,
        ephemeral: true,
      })
    }
    

    const extension = img.contentType.substring('image/'.length)

    await interaction.deferReply({
      ephemeral: true
    })
    const filename = `${img.id}.${extension}`
    await downloadImage(img.url, filename)
    await interaction.editReply(`Image "${img.name}" downloaded as ${filename}`);
  },
};
