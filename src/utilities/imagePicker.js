const axios = require('axios');
const fs = require('node:fs');
const path = require('path');
const config = require('../config');
const { getAllEnabledPics, getXMostRecentBanners } = require('../db')


/** 
 * @param {Client} client 
 */
const pickUsingNewAlgo = async (client) => {

  const REJECT_AMOUNT = 10;
  
  const { db } = client;
  const allRows = await getAllEnabledPics(db);

  const weightedRows = allRows.map(row => ({
    ...row,
    weighted: Math.max
    (row.times_posted, 1) * (Math.random()**1.4)
  }))

  weightedRows.sort((a, b) => a.weighted - b.weighted);

  if(weightedRows.length <= REJECT_AMOUNT) {
    return weightedRows[0]
  }

  const mostRecentBanners = await getXMostRecentBanners(db, REJECT_AMOUNT);
  const mostRecentBannerIds = mostRecentBanners.map(row => row.image_id)

  const limitedImages = weightedRows
    .slice(0, REJECT_AMOUNT + 1)
    .filter(img => !mostRecentBannerIds.includes(img.id));

  return limitedImages[0]
}


/** 
 * @param {Client} client 
 */
const chooseRandomBanner = async (client) => {
  const { db } = client;
  const allRows = await getAllEnabledPics(db);

	// const allImages = fs.readdirSync(config.imagePath).filter(file => file.endsWith('.png'));
  
  const randomImage = allRows[Math.floor(Math.random()*allRows.length)];

  return randomImage;
}


module.exports = {
  chooseRandomBanner,
  pickUsingNewAlgo
}