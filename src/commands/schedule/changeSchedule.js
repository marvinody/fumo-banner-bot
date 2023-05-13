const { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, Client } = require('discord.js');



const { WrongScheduleValue, UserFixableAction } = require('../../utilities/errors')
const { setSetting } = require('../../db');
const config = require('../../config');
const { CRON_TIMES, SETTINGS } = require('../../constants');
const { CronTime } = require('cron');

const allowedChoices =
  Object.keys(CRON_TIMES)
    .map(k => ({ name: k.replace(/_/g, ' '), value: k }))

module.exports = {
  data: new SlashCommandBuilder()
    .setName('schedule')
    .setDescription('Change how often the banner gets updated')
    .addStringOption(option =>
      option
        .setName('schedule')
        .setDescription('How often?')
        .addChoices(...allowedChoices)
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setDMPermission(false),

  /**
    * @param {ChatInputCommandInteraction} interaction
    * @param {Client<boolean>} bot
 */
  async execute(interaction, bot) {

    const property = interaction.options.getString('schedule');
    const value = CRON_TIMES[property];

    try {

      if (!value) {
        throw new WrongScheduleValue();
      }
      await interaction.deferReply({
        ephemeral: true
      })

      bot.job.setTime(new CronTime(value));
      await setSetting(bot.db, SETTINGS.CRON_TIME, value);

      await interaction.editReply(`Schedule has been changed to ${property}`);

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
