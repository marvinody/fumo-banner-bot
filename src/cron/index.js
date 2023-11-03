const { CronJob, CronTime } = require('cron')
const { Client, EmbedBuilder } = require("discord.js");
const config = require('../config');
const fs = require('node:fs');
const path = require('path');
const { CRON_TIMES, SETTINGS,  } = require('../constants')

const { insertImageHistory, updatePostedCount, getSetting, disablePic } = require('../db')
const { chooseRandomBanner, pickUsingNewAlgo } = require('../utilities/imagePicker');
const { addPride } = require('../utilities/addPrideOverlayToImage');
const { addFumoversary } = require('../utilities/addFumoversaryToImage');
const { isJune, isAugust, isOctober, isNovember } = require('../utilities/dates');
const { addHalloween } = require('../utilities/addHalloweenToImage');
const { addThanksgiving } = require('../utilities/addThanksgivingToImage');

/** 
 * @param {Client} client 
 */
const changeServerBanner = async (client) => {
  console.log('starting image rotation');
  // const filepath = await chooseRandomBanner();
  const image = await pickUsingNewAlgo(client);

  const filepath = path.join(config.imagePath, image.filename);


  console.log(`chosen: "${filepath}", id: "${image.id}"`);



  const guild = client.guilds.cache.get(config.guildId);

  let imageResolvable = filepath
  if(isJune()) {
    console.log(`June detected: adding pride overlay`)
    const prideOverlaid = await addPride(filepath);
    imageResolvable = prideOverlaid;
  } else if (isAugust()) {
    console.log(`August detected: adding fumoversary overlay`);
    const fumoversaryOverlaid = await addFumoversary(filepath);
    imageResolvable = fumoversaryOverlaid;
  } else if (isOctober()) {
    console.log(`October detected: adding halloween overlay`);
    const halloweenOverlaid = await addHalloween(filepath);
    imageResolvable = halloweenOverlaid;
  } else if (isNovember()) {
    console.log(`November detected: adding thanksgiving overlay`);
    const thanksgivingOverlaid = await addThanksgiving(filepath);
    imageResolvable = thanksgivingOverlaid;
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