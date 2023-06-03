const path = require('path');
const config = require('../config');
const sharp = require('sharp')

const PRIDE_FLAG_FILENAME = 'pride_frame.png';
const PRIDE_FRAME_FILENAME = 'pride_frame.gif';

const PRIDE_FLAG_FILEPATH = path.join(config.overlays, PRIDE_FLAG_FILENAME);
const PRIDE_FRAME_FILEPATH = path.join(config.overlays, PRIDE_FRAME_FILENAME);

const addPride = async (filepath) => {
  const img = await sharp(filepath)
    .resize(862, 442)
    .extend({
      left: 49,
      top: 49,
      right: 49,
      bottom: 49,
      background: {
        r: 0,
        b: 0,
        g: 0,
        alpha: 0,
      }
    })
    .toBuffer();

  return sharp(PRIDE_FRAME_FILEPATH, {
    animated: true,
  })
    .composite(
      [
        {
          input: img, 
          tile: true,
          gravity: 'northwest'
        },
      ]
    )
    .toFormat('gif')
    .toBuffer()
};


const addPrideAndSaveToFile = async (filepath, out, blend = 'overlay') => {
  const img = await sharp(filepath)
    .resize(862, 442)
    .extend({
      left: 49,
      top: 49,
      right: 49,
      bottom: 49,
      background: {
        r: 0,
        b: 0,
        g: 0,
        alpha: 0,
      }
    })
    .toBuffer();

  return sharp(PRIDE_FRAME_FILEPATH, {
    animated: true,
  })
    .composite(
      [
        {
          input: img, 
          tile: true,
          gravity: 'northwest'
        },
      ]
    )
    .toFormat('gif')
    .toFile(out)
};


module.exports = {
  addPride,
  addPrideAndSaveToFile,
}