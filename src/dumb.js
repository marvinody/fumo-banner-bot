const config = require("./config");
const { addFumoversaryAndSaveToFile } = require("./utilities/addFumoversaryToImage");
const {readdir, mkdir} = require('node:fs/promises')
const path = require('path');

const outFolder = 'temp-folder/fumoversary';

(async () => {
  const imagesDirList = await readdir(config.imagePath);
  const images = imagesDirList.filter(img => img.endsWith('.png'))



  await mkdir(path.join(outFolder), { recursive: true});
  for (const image of images) {
    console.log(`doing: ${image}`)
    
    const noExtFilename = image.slice(0, -'.png'.length);

      const filepath = path.join(config.imagePath, image);
      const outfile = path.join(outFolder, `${noExtFilename}.png`);
      await addFumoversaryAndSaveToFile(filepath, outfile)

  }

})();