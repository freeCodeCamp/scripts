/* eslint-disable no-process-exit */
require('dotenv').load();
const fs = require('fs');
const assert = require('assert');
const mongodb = require('mongodb');
const map = require('map-stream');
const validator = require('validator');
const through = require('through2');

const MongoClient = mongodb.MongoClient;

const filepath = process.argv[2];

assert(
  filepath,
  `
  This script must be called with a filepath argument like so:
  node ./get-emails ./emails.csv
  `
);

const writeStream = fs.createWriteStream(filepath);
writeStream.write('id, email\n');

MongoClient.connect(process.env.MONGODB_URI, function(err, database) {
  if (err) {
    throw err;
  }

  database.collection('user').aggregate([
    { $match: { email: { $exists: true } } },
    { $match: { email: { $ne: '' } } },
    { $match: { email: { $ne: null } } },
    { $project: { _id: 1, email: 1 } }
  ])
    .batchSize(10)
    .pipe(through.obj((user, _, cb) => {
      if (validator.isEmail(user.email)) {
        return cb();
      }
      return cb(null, user);
    }))
    .pipe(map(({ _id, email }, cb) => cb(null, _id + ', ' + email + '\n')))
    .pipe(writeStream)
    .on('finish', () => {
      console.log(`
        Process complete. Emails have been written to ${filepath}.
      `);
      process.exit(0);
    });
});


