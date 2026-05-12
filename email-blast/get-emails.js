/* eslint-disable no-process-exit */
require('dotenv').config();

const Stream = require('stream');
const fs = require('fs');
const assert = require('assert');
const { MongoClient } = require('mongodb');
const validator = require('validator');
const emailValidator = require('email-validator');
const ora = require('ora');
const filePath = process.argv[2];

const validOutput = fs.createWriteStream(filePath, { encoding: 'utf8' });
const invalidOutput = fs.createWriteStream('./invalidEmails.csv', {
  encoding: 'utf8'
});

validOutput.write('email,unsubscribeId\n');
invalidOutput.write('email,unsubscribeId\n');

const rs = new Stream.Readable({ objectMode: true });
rs._read = function () {};

rs.on('data', ({ email, unsubscribeId }) => {
  if (validator.isEmail(email)) {
    validOutput.write(`${email},${unsubscribeId}\n`);
  } else if (emailValidator.validate(email)) {
    validOutput.write(`${email},${unsubscribeId}\n`);
  } else {
    invalidOutput.write(`${email},${unsubscribeId}\n`);
  }
});

assert(
  filePath,
  `
  This script must be called with a filepath argument like so:

  npm run mailing-list -- './emails.csv'

  `
);

const {
  MONGO_DB,
  MONGO_PASSWORD,
  MONGO_RS,
  MONGO_USER,
  MONGODB_URI
} = process.env;

async function main() {
  const client = new MongoClient(MONGODB_URI, {
    auth: { username: MONGO_USER, password: MONGO_PASSWORD },
    replicaSet: MONGO_RS,
    maxPoolSize: 20
  });

  await client.connect();
  const db = client.db(MONGO_DB);

  const stream = db
    .collection('user')
    .find(
      {
        sendQuincyEmail: true,
        email: { $nin: [null, ''], $not: /(test|fake)/i }
      },
      { projection: { email: 1, unsubscribeId: 1 } }
    )
    .batchSize(500)
    .stream();

  const spinner = ora('Begin querying emails ...');
  spinner.start();

  stream.on('data', ({ email, unsubscribeId }) => {
    spinner.text = `Getting info for: ${email}\n`;
    rs.push({ email, unsubscribeId });
  });

  stream.on('end', () => {
    rs.push(null);
    client.close();
    spinner.succeed('Completed compiling mailing list.');
  });

  stream.on('error', err => {
    spinner.fail(`Stream error: ${err.message}`);
    client.close();
    process.exit(1);
  });
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
