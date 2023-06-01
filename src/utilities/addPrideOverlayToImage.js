const path = require('path');
const config = require('../config');
const sharp = require('sharp')

const PRIDE_FLAG_FILENAME = 'pride_flag.png';

const PRIDE_FLAG_FILEPATH = path.join(config.overlays, PRIDE_FLAG_FILENAME);

const addPride = (filepath) => {
  return sharp(filepath)
    .greyscale()
    .composite(
      [
        { input: PRIDE_FLAG_FILEPATH, blend: 'overlay' },
      ]
    )
    .toFormat(config.outputImageType)
    .toBuffer()
};


module.exports = {
  addPride,
}