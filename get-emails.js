/* eslint-disable no-process-exit */
require('dotenv').config();

const Stream = require('stream');
const fs = require('fs');
const assert = require('assert');
const mongodb = require('mongodb');
const validator = require('validator');
const emailValidator = require('email-validator');

const MongoClient = mongodb.MongoClient;
const filePath = process.argv[2];

const validOutput = fs.createWriteStream(filePath, { encoding: 'utf8' });
const invalidOutput = fs.createWriteStream('./invalidEmails.csv', { encoding: 'utf8' });

validOutput.write('email,unsubscribeId\n');
invalidOutput.write('email,unsubscribeId\n');

const rs = new Stream.Readable({objectMode: true})
rs._read = function() {}

rs.on('data', ({email, unsubscribeId}) => {
  if(validator.isEmail(email)) {
    validOutput.write(`${email},${unsubscribeId}\n`);
  } else if (emailValidator.validate(email)) {
    validOutput.write(`${email},${unsubscribeId}\n`);
  } else {
    invalidOutput.write(`${email},${unsubscribeId}\n`);
  }
})

assert(
  filePath,
  `
  This script must be called with a filepath argument like so:

  yarn mailing-list ./emails.csv

  `
);

MongoClient.connect(process.env.MONGODB_URI, { useNewUrlParser: true }, function(err, client) {
  const db = client.db(process.env.MONGO_DB)
  if (err) {
    throw err;
  }

  const stream = db.collection('user').find({
    $and: [
      { email: { $exists: true } },
      { email: { $ne: '' } },
      { email: { $ne: null } },
      { email: { $not: /(test|fake)/i } },
      { $or: [
          { sendQuincyEmail: true },
          { sendQuincyEmail: { $exists: false } },
          { sendQuincyEmail: null }
        ]
      }
    ]
  }, {
    email: 1,
    unsubscribeId: 1
  }).batchSize(100).stream();

  stream.on('data', ({email, unsubscribeId}) => {
    const data = {email, unsubscribeId};
    rs.push(data)
  })

  stream.on('end', () => {rs.push(null);client.close()});


});


/**
 * [
    { $match: { email: { $exists: true } } },
    { $match: { email: { $ne: '' } } },
    { $match: { email: { $ne: null } } },
    { $match: { email: { $not: /(test|fake)/i } } },
    {
      $match: {
        $or: [
          { sendQuincyEmail: true },
          { sendQuincyEmail: { $exists: false } },
          { sendQuincyEmail: null }
        ]
      }
    },
    { $project: { _id: 0, email: 1, unsubscribeId: 1 } }
  ]
 */