const path = require('path');
const config = require('../config');
const sharp = require('sharp')

const PRIDE_FLAG_FILENAME = 'pride_frame.png';

const PRIDE_FLAG_FILEPATH = path.join(config.overlays, PRIDE_FLAG_FILENAME);

const addPride = async (filepath) => {
  const img = await sharp(filepath)
    .resize(862, 442)
    .toBuffer();

  return sharp(PRIDE_FLAG_FILEPATH)
    .composite(
      [
        { input: img, top: 49, left: 49, },
      ]
    )
    .toFormat(config.outputImageType)
    .toBuffer()
};


const addPrideAndSaveToFile = async (filepath, out, blend = 'overlay') => {
  const img = await sharp(filepath)
    .resize(862, 442)
    .toBuffer();

  return sharp(PRIDE_FLAG_FILEPATH)
    .composite(
      [
        {
          input: img, top: 49, left: 49
        },
      ]
    )
    .toFormat(config.outputImageType)
    .toFile(out)
};


module.exports = {
  addPride,
  addPrideAndSaveToFile,
}