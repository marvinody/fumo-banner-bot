const path = require('path');
const config = require('../config');
const sharp = require('sharp');
const { isOctober } = require('./dates');

const HALLOWEEN_FILENAME = 'halloween.png';

const HALLOWEEN_FILEPATH = path.join(config.overlays, HALLOWEEN_FILENAME);

const transform = async (filepath) => {
  const img = sharp(filepath, {
    sequentialRead: false
  })

  const background = sharp(HALLOWEEN_FILEPATH, {
    sequentialRead: false,
  })

  return img
    .composite(
      [
        {
          input: await background.toBuffer(),
          tile: true,
          gravity: 'northwest',
          sequentialRead: false,
        },
      ]
    )
    .toFormat('png')
}

const addHalloween = async (filepath) => {
  const composite = await transform(filepath);
  return composite.toBuffer()
};


const addHalloweenAndSaveToFile = async (filepath, out, blend = 'overlay') => {
  const composite = await transform(filepath);
  return composite.toFile(out)
};


module.exports = {
  name: 'Halloween',
  applyToBuffer: addHalloween,
  isActive: isOctober,
  priority: 1,
  addHalloweenAndSaveToFile,
}