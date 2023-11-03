const path = require('path');
const config = require('../config');
const sharp = require('sharp')

const THANKSGIVING_FILENAME = 'thanksgiving.png';

const THANKSGIVING_FILEPATH = path.join(config.overlays, THANKSGIVING_FILENAME);

const transform = async (filepath) => {
  const img = sharp(filepath, {
    sequentialRead: false
  })

  const background = sharp(THANKSGIVING_FILEPATH, {
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

const addThanksgiving = async (filepath) => {
  const composite = await transform(filepath);
  return composite.toBuffer()
};


const addThanksgivingAndSaveToFile = async (filepath, out, blend = 'overlay') => {
  const composite = await transform(filepath);
  return composite.toFile(out)
};


module.exports = {
  addThanksgiving,
  addThanksgivingAndSaveToFile,
}