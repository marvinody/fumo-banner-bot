const sharp = require("sharp");
const { isAprilFirst } = require("./dates");

const EFFECTS = {
  SWAP_HALVES_VERTICAL: "swap-halves-vertical",
  SWAP_HALVES_HORIZONTAL: "swap-halves-horizontal",
  FLIP_UPSIDE_DOWN: "flip-upside-down",
};

const EFFECT_POOL = [
  EFFECTS.SWAP_HALVES_VERTICAL,
  EFFECTS.SWAP_HALVES_HORIZONTAL,
  EFFECTS.FLIP_UPSIDE_DOWN,
];

const chooseRandomEffect = () => {
  const index = Math.floor(Math.random() * EFFECT_POOL.length);
  return EFFECT_POOL[index];
};

const swapHalvesVertical = async (filepath) => {
  const image = sharp(filepath, { sequentialRead: false });
  const metadata = await image.metadata();

  const width = metadata.width;
  const height = metadata.height;
  const middleY = Math.floor(height / 2);

  const topHeight = middleY;
  const bottomHeight = height - middleY;

  const topHalf = await sharp(filepath, { sequentialRead: false })
    .extract({ left: 0, top: 0, width, height: topHeight })
    .toBuffer();

  const bottomHalf = await sharp(filepath, { sequentialRead: false })
    .extract({ left: 0, top: middleY, width, height: bottomHeight })
    .toBuffer();

  return sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      {
        input: bottomHalf,
        top: 0,
        left: 0,
      },
      {
        input: topHalf,
        top: bottomHeight,
        left: 0,
      },
    ])
    .toFormat("png")
    .toBuffer();
};

const swapHalvesHorizontal = async (filepath) => {
  const image = sharp(filepath, { sequentialRead: false });
  const metadata = await image.metadata();

  const width = metadata.width;
  const height = metadata.height;
  const middleX = Math.floor(width / 2);

  const leftWidth = middleX;
  const rightWidth = width - middleX;

  const leftHalf = await sharp(filepath, { sequentialRead: false })
    .extract({ left: 0, top: 0, width: leftWidth, height })
    .toBuffer();

  const rightHalf = await sharp(filepath, { sequentialRead: false })
    .extract({ left: middleX, top: 0, width: rightWidth, height })
    .toBuffer();

  return sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      {
        input: rightHalf,
        top: 0,
        left: 0,
      },
      {
        input: leftHalf,
        top: 0,
        left: rightWidth,
      },
    ])
    .toFormat("png")
    .toBuffer();
};

const flipUpsideDown = async (filepath) => {
  return sharp(filepath, { sequentialRead: false })
    .flip()
    .toFormat("png")
    .toBuffer();
};

const addAprilFools = async (filepath) => {
  const effect = chooseRandomEffect();

  if (effect === EFFECTS.SWAP_HALVES_VERTICAL) {
    return swapHalvesVertical(filepath);
  }

  if (effect === EFFECTS.SWAP_HALVES_HORIZONTAL) {
    return swapHalvesHorizontal(filepath);
  }

  return flipUpsideDown(filepath);
};

const addAprilFoolsAndSaveToFile = async (filepath, out) => {
  const transformed = await addAprilFools(filepath);
  return sharp(transformed, { sequentialRead: false }).toFile(out);
};

module.exports = {
  name: "April Fools",
  applyToBuffer: addAprilFools,
  isActive: isAprilFirst,
  priority: 20,
  addAprilFoolsAndSaveToFile,
};
