const axios = require('axios');
const fs = require('node:fs');
const path = require('path');
const config = require('../config')

const downloadImage = (url, name) => {
  return axios({
    method: "get",
    url,
    responseType: "stream"
  }).then(function (response) {
    const filepath = path.join(config.imagePath, name);
    response.data.pipe(fs.createWriteStream(filepath));
  });

};
exports.downloadImage = downloadImage;
