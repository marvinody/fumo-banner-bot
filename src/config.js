const path = require('path');

const { MINIMUM_HEIGHT, MINIMUM_WIDTH, CRON_TIMES } = require('./constants')

module.exports = {
  clientId: process.env.CLIENT_ID,
  guildId: process.env.GUILD_ID.trim(),
  token: process.env.BOT_TOKEN,
  imagePath: path.join(__dirname, '..', 'images'),
  resizedHeight: MINIMUM_HEIGHT,
  resizedWidth: MINIMUM_WIDTH,
  outputImageType: 'png',
  defaultCronTime: CRON_TIMES.EVERY_HOUR,
  overlays: path.join(__dirname, '..', 'overlays'),
}