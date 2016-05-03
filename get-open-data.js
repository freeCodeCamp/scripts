require('dotenv').load();
var secrets = require('../config/secrets'),
    mongodb = require('mongodb'),
    MongoClient = mongodb.MongoClient;

MongoClient.connect(secrets.db, function(err, db) {

});
