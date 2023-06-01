const isJune = () => {
  const now = new Date();
  now.setHours(now.getHours() + 3);
  // JavaScript months are zero-indexed
  const month = now.getMonth() + 1; 
  return month === 6;
}


module.exports = {
  isJune,
}