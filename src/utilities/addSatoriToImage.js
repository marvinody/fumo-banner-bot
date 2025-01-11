const path = require('path');
const config = require('../config');
const sharp = require('sharp');
const { DateTime, Info } = require("luxon");


const OVERLAY_FILENAME = 'satori.png';

const OVERLAY_FILEPATH = path.join(config.overlays, OVERLAY_FILENAME);

const INNER_WIDTH = 835
const INNER_HEIGHT = 470
const RIGHT_PADDING = 960 - INNER_WIDTH;
const BOTTOM_PADDING = 540 - INNER_HEIGHT;

const transform = async (filepath) => {
  const img = sharp(filepath, {
    sequentialRead: false
  })
  .resize(INNER_WIDTH, INNER_HEIGHT)
  .extend({
    right: RIGHT_PADDING,
    bottom: BOTTOM_PADDING,
    background: {
      r: 0,
      b: 0,
      g: 0,
      alpha: 0,
    }
  })


  const background = sharp(OVERLAY_FILEPATH, {
    sequentialRead: false,
  })

  return img
    .composite(
      [
        {
          input: await background.toBuffer(),
          gravity: 'northwest',
          sequentialRead: false,
        },
      ]
    )
    .toFormat('png')
}

const addSatori = async (filepath) => {
  const composite = await transform(filepath);
  return composite.toBuffer()
};


const addSatoriAndSaveToFile = async (filepath, out, blend = 'overlay') => {
  const composite = await transform(filepath);
  return composite.toFile(out)
};

const isSatoriDay = () => {
  const now = DateTime.now().plus({
    hours: 3,
  });
  
  return now.month === 3 && now.day === 10;
}


module.exports = {
  name: 'Satori Day',
  applyToBuffer: addSatori,
  isActive: isSatoriDay,
  priority: 10,
  addSatoriAndSaveToFile,
}