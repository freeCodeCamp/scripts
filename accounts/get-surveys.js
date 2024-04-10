/* eslint-disable no-process-exit */

// This script gets Survey data from the database and writes it to a
// surveys.json file. After running the script and getting the JSON output,
// you need to manually remove the last comma in the output file.

require('dotenv').config();

const fs = require('fs');
const mongodb = require('mongodb');
const ora = require('ora');

const { MongoClient } = mongodb;

// Change this to get a specific survey
const surveyTitle = 'Foundational C# with Microsoft Survey';

const outputFile = fs.createWriteStream('surveys.json', { encoding: 'utf8' });

// write first bracket in array
outputFile.write('[\n');

const { MONGO_DB, MONGO_PASSWORD, MONGO_RS, MONGO_USER, MONGODB_URI } =
  process.env;

MongoClient.connect(
  MONGODB_URI,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    replicaSet: MONGO_RS,
    readPreference: 'secondary',
    auth: { user: MONGO_USER, password: MONGO_PASSWORD },
    poolSize: 20
  },
  function (err, client) {
    if (err) {
      throw err;
    }
    const db = client.db(MONGO_DB);

    const stream = db
      .collection('Survey')
      .find({ title: { $eq: surveyTitle } }, { responses: 1 })
      .batchSize(100)
      .stream();

    const spinner = ora('Querying surveys ...');
    spinner.start();

    stream.on('data', ({ responses }) => {
      if (Array.isArray(responses)) {
        const jsonStr = JSON.stringify(responses);
        outputFile.write(`${jsonStr},\n`);
      }
    });

    stream.on('end', () => {
      outputFile.write(']');
      client.close();
      spinner.succeed(
        'Completed compiling surveys taken. Be sure to go delete the comma after the last item in surveys.json :)'
      );
    });

    stream.on('error', err => {
      console.error('Error occurred while streaming data:', err);
      process.exit(1);
    });
  }
);
