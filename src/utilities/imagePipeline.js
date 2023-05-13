const axios = require('axios');
const fs = require('node:fs');
const path = require('path');
const config = require('../config');
const sharp = require('sharp')


const downloadImageStream = (url) => {
  return axios({
    method: "get",
    url,
    responseType: "stream"
  }).then(function (response) {
    return response.data
  });

};


const resizeImageStream = (width, height) => {
  return sharp().resize({
    width,
    height,
  }).toFormat(config.outputImageType)
}


const writeImageStream = (filepath) => {
    return fs.createWriteStream(filepath)
}

const pipeline = async (url, name) => {

  const readableStream = await downloadImageStream(url);
  const transformer = resizeImageStream(config.resizedWidth, config.resizedHeight);
  
  const filepath = path.join(config.imagePath, name);
  const writeStream = writeImageStream(filepath);

  return readableStream.pipe(transformer).pipe(writeStream)

}

module.exports = {
  pipeline
}