/* eslint-disable no-process-exit */
import 'dotenv/config';

import { Readable } from 'stream';
import { createWriteStream } from 'fs';
import assert from 'assert';
import { MongoClient } from 'mongodb';
import validator from 'validator';
import emailValidator from 'email-validator';
import ora from 'ora';

interface EmailRecord {
  email: string;
  unsubscribeId: string;
}

const assertEnv = <T extends string | undefined>(env: T): env is NonNullable<T> => {
  try {
    assert(env, `${env} environment variable is required`);
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

const filePath = process.argv[2];

assert(
  filePath,
  `
  This script must be called with a filepath argument like so:

  pnpm start

  `
);

const validOutput = createWriteStream(/^\.?\/.+/.exec(filePath) ? filePath : `./${filePath}`, { encoding: 'utf8' });
const invalidOutput = createWriteStream('./invalidEmails.csv', {
  encoding: 'utf8'
});

validOutput.write('email,unsubscribeId\n');
invalidOutput.write('email,unsubscribeId\n');

const rs = new Readable({ objectMode: true, read() {} });

rs.on('data', ({ email, unsubscribeId }: EmailRecord) => {
  if (validator.isEmail(email)) {
    validOutput.write(`${email},${unsubscribeId}\n`);
  } else if (emailValidator.validate(email)) {
    validOutput.write(`${email},${unsubscribeId}\n`);
  } else {
    invalidOutput.write(`${email},${unsubscribeId}\n`);
  }
});

const { MONGO_DB: mongoDb, MONGO_PASSWORD: mongoPassword, MONGO_RS: mongoRs, MONGO_USER: mongoUser, MONGODB_URI: mongoUri } =
  process.env;

async function main(): Promise<void> {
  if (!assertEnv(mongoUri) || !assertEnv(mongoDb) || !assertEnv(mongoUser) || !assertEnv(mongoPassword) || !assertEnv(mongoRs)) {
    process.exit(1);
  }

  const client = new MongoClient(mongoUri, {
    auth: { username: mongoUser, password: mongoPassword },
    replicaSet: mongoRs,
    maxPoolSize: 20
  });

  await client.connect();
  const db = client.db(mongoDb);

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

  let count = 0;

  stream.on('data', ({ email, unsubscribeId }: EmailRecord) => {
    count++;
    if (count % 10000 === 0) {
      spinner.text = `Fetching next batch of 10000 emails, ${count} emails fetched so far. Sample email: ${email}`;
    }
    rs.push({ email, unsubscribeId });
  });

  stream.on('end', () => {
    rs.push(null);
    void client.close();
    spinner.succeed('Completed compiling mailing list.');
  });

  stream.on('error', (err: Error) => {
    spinner.fail(`Stream error: ${err.message}`);
    void client.close();
    process.exit(1);
  });
}

main().catch((err: Error) => {
  console.error(err);
  process.exit(1);
});
