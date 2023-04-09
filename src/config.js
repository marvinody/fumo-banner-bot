const path = require('path')
module.exports = {
  clientId: process.env.CLIENT_ID,
  guildId: process.env.GUILD_ID.trim(),
  token: process.env.BOT_TOKEN,
  imagePath: path.join(__dirname, '..', 'images')
}