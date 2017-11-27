/* eslint-disable no-process-exit */
require('dotenv').load();
const { Observable } = require('rxjs');
const mongodb = require('mongodb');
const invalid = require('./still-invalid.json');

const MongoClient = mongodb.MongoClient;
const ObjectId = mongodb.ObjectId;

MongoClient.connect(process.env.MONGODB_URI, function(err, db) {
  if (err) {
    throw err;
  }
  Observable.from(invalid)
    .concatMap(({ _id }) =>
      Observable.defer(() =>
        db.collection('user').deleteOne({ _id: ObjectId(_id) }))
    )
    .toArray()
    .subscribe(
      deletes => console.log('deletes: ', deletes),
      err => { throw err; },
      () => db.close()
    );
});
