/* eslint-disable no-process-exit */
require('dotenv').load();
var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;

MongoClient.connect(process.env.MONGODB_URI, function(err, database) {
  if (err) {
    throw err;
  }

  database.collection('user').aggregate([
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
    { $group: { _id: 1, emails: { $addToSet: '$email' } } }
  ], function(err, results) {
    if (err) { throw err; }

    console.log('\"email\"\n\"' + results[0].emails.join('\"\n\"') + '\"');
    process.exit(0);
  });
});
