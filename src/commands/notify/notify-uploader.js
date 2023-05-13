const { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, userMention } = require('discord.js');
const { SETTINGS } = require('../../constants')
const { is16by9AR } = require('../../utilities/imageSizeChecker')
const { UserFixableAction, WrongFileType, ImageWrongAspectRatio, ImageFilesizeTooLarge } = require('../../utilities/errors')
const { getXMostRecentBanners, getPicById, setSetting } = require('../../db')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('notification')
    .setDescription("Get notified by DM when your image comes up on rotation!")
    .addSubcommand((subcommand) =>
      subcommand
        .setName('yes')
        .setDescription('Bot will DM you when any of your images are on the banner'))
    .addSubcommand((subcommand) =>
      subcommand
        .setName('no')
        .setDescription('Bot will NOT DM you when any of your images are on the banner'))
    .setDefaultMemberPermissions(PermissionFlagsBits.AttachFiles)
    .setDMPermission(true),

  /**
   * @param {ChatInputCommandInteraction} interaction
   * @param {Eris.Client} bot
  */
  async execute(interaction, bot) {

    await interaction.deferReply({
      ephemeral: true,
    })

    const subcommand = interaction.options.getSubcommand();
    const user = interaction.user;
    let value = true;

    if(subcommand === 'no') {
      value = false;
    }

    if(value) {
      bot[SETTINGS.DM_PREF].set(user.id, true);
    } else {
      bot[SETTINGS.DM_PREF].delete(user.id);
    }

    await setSetting(bot.db, SETTINGS.DM_PREF, Object.fromEntries(bot[SETTINGS.DM_PREF]));

    return interaction.editReply({
      content: `The bot **${value ? 'will' : 'will not'}** DM you from now on for banner notifications.`,
      ephemeral: true,
    })

  },
};
