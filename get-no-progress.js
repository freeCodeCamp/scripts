/* eslint-disable no-process-exit */
require('dotenv').load();
const fs = require('fs');
const { Observable } = require('rxjs');
const assert = require('assert');
const mongodb = require('mongodb');
const invalid = require('./invalids.json');

const MongoClient = mongodb.MongoClient;
const ObjectId = mongodb.ObjectId;

const filepath = process.argv[2];

assert(
  filepath,
  `
  This script must be called with a filepath argument like so:
  node ./get-emails ./emails.csv
  `
);

MongoClient.connect(process.env.MONGODB_URI, function(err, db) {
  if (err) {
    throw err;
  }
  Observable.from(invalid)
    .concatMap(({ _id }) =>
      Observable.defer(() =>
          db.collection('user').findOne({ _id: ObjectId(_id) }))
        .do(user =>
          console.log(
            'found %s for %s',
            !user || !user._id ? null : user._id,
            ObjectId(_id)))
        .filter(
          ({ progressTimestamps = [] } = {}) => progressTimestamps.length <= 1)
    )
    .map(({ _id, email }) => ({ _id, email }))
    .toArray()
    .subscribe(
      users => fs.writeFileSync(filepath, JSON.stringify(users, null, 2)),
      err => { throw err; },
      () => db.close()
    );
});
