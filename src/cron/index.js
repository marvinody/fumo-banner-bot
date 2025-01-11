const { CronJob, CronTime } = require('cron')
const { Client, EmbedBuilder } = require("discord.js");
const config = require('../config');
const fs = require('node:fs');
const path = require('path');
const { CRON_TIMES, SETTINGS,  } = require('../constants')

const { insertImageHistory, updatePostedCount, getSetting, disablePic } = require('../db')
const { chooseRandomBanner, pickUsingNewAlgo } = require('../utilities/imagePicker');
const pride = require('../utilities/addPrideOverlayToImage');
const fumoversary = require('../utilities/addFumoversaryToImage');
const halloween = require('../utilities/addHalloweenToImage');
const thanksgiving = require('../utilities/addThanksgivingToImage');
const christmas = require('../utilities/addChristmasToImage');
const yuyukoDay = require('../utilities/addYuyukoToImage');

/** 
 * @param {Client} client 
 */
const changeServerBanner = async (client) => {
  console.log('starting image rotation');
  // const image = await chooseRandomBanner(client);
  const image = await pickUsingNewAlgo(client);

  const filepath = path.join(config.imagePath, image.filename);

  console.log(`chosen: "${filepath}", id: "${image.id}"`);

  const guild = client.guilds.cache.get(config.guildId);

  let imageResolvable = filepath

  const events = [
    pride,
    fumoversary,
    halloween,
    thanksgiving,
    christmas,
    yuyukoDay,
  ]

  const activeEvents = events.filter(event => event.isActive())
  // highest priority first
  const sortedEvents = activeEvents.sort((a, b) => b.priority - a.priority)

  if (sortedEvents.length > 0) {
    const event = sortedEvents[0]
    console.log(`${event.name} detected: adding overlay`)
    const overlaid = await event.applyToBuffer(filepath)
    imageResolvable = overlaid
  }

  try {
      await guild.edit({
        banner: imageResolvable,
      })
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.error(`INVALID FILEPATH ABOVE: ${image.id}`);
      console.info(`disabling pic: ${image.id}`)
      await disablePic(client.db, image.id)
      return;
    }
    throw err;
  }

  await updatePostedCount(client.db, image.id);
  await insertImageHistory(client.db, image.id);

  const shouldDMUser = client[SETTINGS.DM_PREF].has(image.user_id);

  if(shouldDMUser) {
    try {
      client.users.send(image.user_id, {
        content: "Your image just got rotated into the banner!",
        files: [filepath]
      })
    } catch (err) {
      console.error("Error DMing user")
      console.error(err)
    }
  }
  console.log('finished image rotation')
  return;
}



/**
 * @param {Client} client 
 */
module.exports = async (client) => {

  const cronjobTime = await getSetting(client.db, SETTINGS.CRON_TIME, config.defaultCronTime)

  const job = new CronJob(
    cronjobTime,
    changeServerBanner.bind(null, client),
  )
  return job
}