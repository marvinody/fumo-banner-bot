const path = require('path');
const config = require('../config');
const sharp = require('sharp')

const CHRISTMAS_FILENAME = 'christmas.png';

const CHRISTMAS_FILEPATH = path.join(config.overlays, CHRISTMAS_FILENAME);

const transform = async (filepath) => {
  const img = sharp(filepath, {
    sequentialRead: false
  })

  const background = sharp(CHRISTMAS_FILEPATH, {
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

const addChristmas = async (filepath) => {
  const composite = await transform(filepath);
  return composite.toBuffer()
};


const addChristmasAndSaveToFile = async (filepath, out, blend = 'overlay') => {
  const composite = await transform(filepath);
  return composite.toFile(out)
};


module.exports = {
  addChristmas,
  addChristmasAndSaveToFile,
}