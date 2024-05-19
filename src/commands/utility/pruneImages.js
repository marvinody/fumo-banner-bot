const { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, Client, DiscordAPIError } = require('discord.js');



const { WrongScheduleValue, UserFixableAction } = require('../../utilities/errors')
const { getAllUsersWithEnabled, disableAllPicsByUserId } = require('../../db');
const config = require('../../config');
const { CRON_TIMES, SETTINGS } = require('../../constants');
const { CronTime } = require('cron');

const isInGuild = async (interaction, userId) => {
  try {
    await interaction.guild.members.fetch(userId);
    return true;
  } catch (err) {
    if (err instanceof DiscordAPIError && (err.code === 10013 || err.code === 10007)) {
      return false;
    }

    throw err;
  }
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('prune-images')
    .setDescription('Remove images from rotation of people who have left the server')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setDMPermission(false),

  /**
    * @param {ChatInputCommandInteraction} interaction
    * @param {Client<boolean>} bot
 */
  async execute(interaction, bot) {

    try {
      await interaction.deferReply({
        ephemeral: true
      })

      const users = await getAllUsersWithEnabled(bot.db);
      const userIds = users.map(user => user.user_id);

      await interaction.editReply(`Pruning ${userIds.length} users from the rotation`);

      let idx = 0;
      let pruned = 0;
      for (const userId of userIds) {
        idx++;
    
        const isInServer = await isInGuild(interaction, userId);
        if (isInServer) {
          continue;
        }
        console.log(`Pruning user ${userId}`);

        await disableAllPicsByUserId(bot.db, userId);
        pruned++;
      }

      await interaction.editReply(`Pruned ${pruned} users from the rotation, total users checked: ${idx}`);

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
