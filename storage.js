'use strict';

const Readable = require('stream').Readable;
const { Storage } = require('@google-cloud/storage');
const storage = new Storage();
const bucket = storage.bucket('browserslist-targets');
const fileOptions = {
  gzip: true,
  metadata: {
    cacheControl: 'no-cache'
  }
};

exports.find = async function find(id) {
  try {
    let file = bucket.file(id);
    let contents = await file.download({ validation: false });

    return JSON.parse(contents.toString('utf8'));
  } catch(e) {
    console.log(e);
    return {};
  }
};

exports.findAll = async function findAll() {
  let [files] = await bucket.getFiles();
  
  return files;
}

exports.upload = async function upload(idOrFile, list) {
  let file;

  if (typeof idOrFile === 'string') {
    file = bucket.file(idOrFile);
  } else {
    file = idOrFile;
  }

  const stream = new Readable();
  const content = JSON.stringify({
    list,
    updated: new Date()
  }, null, 2);

  // can remove when node version > 9.2.1
  stream._read = () => {};

  stream.push(content);
  stream.push(null);

  await new Promise((resolve, reject) => {
    stream
      .pipe(file.createWriteStream(fileOptions))
      .on('error', function(err) {
        reject(err)
      })
      .on('finish', function() {
        resolve();
      });
  });
};