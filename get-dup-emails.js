/* eslint-disable no-process-exit */
require('dotenv').load();
var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;

MongoClient.connect(process.env.MONGODB_URI, function(err, database) {
  if (err) {
    throw err;
  }

  database.collection('user').aggregate([
    {
      $group: {
        _id: '$email',
        count: { $sum: 1 }
      }
    },
    {
      $match: {
        _id: { $ne: null },
        count: { $gt: 1 }
      }
    },
    {
      $project: {
        email: '$_id',
        _id: 0
      }
    },
    {
      $group: {
        _id: 1,
        usernames: { $addToSet: '$email' }
      }
    }
  ], function(err, results) {
    if (err) { throw err; }

    // console.log('\n@' + results[0].usernames.join('\n@'));
    console.log(results[0].usernames.length);
    process.exit(0);
  });
});
