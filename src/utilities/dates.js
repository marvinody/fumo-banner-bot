const isJune = () => {
  const now = new Date();
  now.setHours(now.getHours() + 3);
  // JavaScript months are zero-indexed
  const month = now.getMonth() + 1; 
  return month === 6;
}

const isAugust = () => {
  const now = new Date();
  now.setHours(now.getHours() + 3);
  // JavaScript months are zero-indexed
  const month = now.getMonth() + 1; 
  return month === 8;
}

const isOctober = () => {
  const now = new Date();
  now.setHours(now.getHours() + 3);
  // JavaScript months are zero-indexed
  const month = now.getMonth() + 1; 
  return month === 10;
}


module.exports = {
  isJune,
  isAugust,
  isOctober,
}