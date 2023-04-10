const { CronJob } = require('cron')
const { Client } = require("discord.js");
const config = require('../config');
const fs = require('node:fs');
const path = require('path')

/** 
 * @param {Client} client 
 */
const uploadRandomBanner = async (client) => {
  console.log('starting image rotation')

	const allImages = fs.readdirSync(config.imagePath).filter(file => file.endsWith('.png'));
  
  const randomImage = allImages[Math.floor(Math.random()*allImages.length)];
  const randomFilepath = path.join(config.imagePath, randomImage);
  console.log(`chosen: "${randomFilepath}"`);

  const guild = client.guilds.cache.get(config.guildId);

  guild.edit({
    banner: randomFilepath,
  })

  console.log('finished image rotation')
}

/**
 * @param {Client} client 
 */
module.exports = (client) => {
  const job = new CronJob(
    '0 0 * * * *',
    // '0 */5 * * * *',
    uploadRandomBanner.bind(null, client),
  )

  return job;
}