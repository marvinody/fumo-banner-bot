const sharp = require('sharp');

// from chatgpt
const is16by9AR = (width, height) => {
  const gcd = (a, b) => {
    if (b === 0) {
      return a;
    } else {
      return gcd(b, a % b);
    }
  };

  const divisor = gcd(width, height);

  const aspectWidth = width / divisor;
  const aspectHeight = height / divisor;

  return aspectWidth === 16 && aspectHeight === 9;
}

module.exports = {
  is16by9AR,
}