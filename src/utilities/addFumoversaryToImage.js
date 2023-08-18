const path = require('path');
const config = require('../config');
const sharp = require('sharp')

const FUMOVERSARY_FILENAME = 'fumoversary.png';

const FUMOVERSARY_FILEPATH = path.join(config.overlays, FUMOVERSARY_FILENAME);

const transform = async (filepath) => {
  const img = sharp(filepath, {
    sequentialRead: false
  })
    .resize(874, 451)
    .extend({
      left: 43,
      top: 44,
      right: 43,
      bottom: 45,
      background: {
        r: 0,
        b: 0,
        g: 0,
        alpha: 0,
      }
    })

  const background = sharp(FUMOVERSARY_FILEPATH, {
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

const addFumoversary = async (filepath) => {
  const composite = await transform(filepath);
  return composite.toBuffer()
};


const addFumoversaryAndSaveToFile = async (filepath, out, blend = 'overlay') => {
  const composite = await transform(filepath);
  return composite.toFile(out)
};


module.exports = {
  addFumoversary,
  addFumoversaryAndSaveToFile,
}