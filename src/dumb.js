const config = require("./config");
const { addPrideAndSaveToFile } = require("./utilities/addPrideOverlayToImage");
const {readdir, mkdir} = require('node:fs/promises')
const path = require('path');

const outFolder = 'temp-folder/frame';

(async () => {
  const imagesDirList = await readdir(config.imagePath);
  const images = imagesDirList.filter(img => img.endsWith('.png'))

  const blends = 
  [
  // 'add',
  // 'saturate',
  // 'multiply',
  // 'screen',
  // 'overlay',
  // 'darken',
  // 'lighten',
  // 'colour-dodge',
  // 'colour-burn',
  // 'hard-light',
  'soft-light',
  // 'difference',
  // 'exclusion`',
  ]
  // const blends = 
  // `hard-light`
  // .split(', ')

  for (const image of images) {
    
    await mkdir(path.join(outFolder, image), { recursive: true});

    for (const blend of blends) {
      const filepath = path.join(config.imagePath, image);
      const outfile = path.join(outFolder, `${blend}-${image}`);
      await addPrideAndSaveToFile(filepath, outfile, blend)
    }


  }

})();