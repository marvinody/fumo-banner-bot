const path = require('path');
const config = require('../config');
const sharp = require('sharp');
const { DateTime, Info } = require("luxon");


const OVERLAY_FILENAME = 'yuyuko.png';

const OVERLAY_FILEPATH = path.join(config.overlays, OVERLAY_FILENAME);

const INNER_WIDTH = 865
const INNER_HEIGHT = 505
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

const addYuyuko = async (filepath) => {
  const composite = await transform(filepath);
  return composite.toBuffer()
};


const addYuyukoAndSaveToFile = async (filepath, out, blend = 'overlay') => {
  const composite = await transform(filepath);
  return composite.toFile(out)
};

const isYuyukoDay = () => {
  const now = DateTime.now().plus({
    hours: 3,
  });
  
  return now.month === 2 && now.day === 23;
}


module.exports = {
  addYuyuko,
  addYuyukoAndSaveToFile,
  isYuyukoDay,
}