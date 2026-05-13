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

const isInScreenEnvironment = (): boolean => {
  const termIsCapable
    = process.env.TERM !== undefined
    && process.env.TERMCAP !== undefined;
  return (
    process.env.STY !== undefined
    || process.env.SCREEN !== undefined
    || termIsCapable
  );
};

console.log(`Welcome! This is a replicate of our database query for pulling down the newsletter list. Please note that this is NOT the original script!
  
  This version has been heavily modified to fit the workflows Naomi has established and documented. It was made into a separate script to ensure that I would not break someone else's workflow by changing the original script.
  
  If you want the original, \`cd ../accounts\` and it is \`get-emails.js\`.
  
  Thanks for your patience! Booting the tool now...`)

/**
 * If we do not confirm the user is in a screen session, and the user happens to NOT be in a screen session,
 * killing the SSH connection will terminate this process without warning.
 */
if (!isInScreenEnvironment()) {
  console.error('You must run this script in a screen session to persist the process after closing the SSH connection.');
  process.exit(1);
}

const filePath = process.argv[2];

assert(
  filePath,
  `
  It is advised to run this script with \`pnpm start\` if you are using Naomi's email automation tool.
  This will save the email list to the location that tool expects it to be.

  Otherwise, you can run this script with a filepath argument like so:

  op run --env-file=./prod.env --no-masking -- tsx get-emails.ts ./email.csv
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
    console.error(`One or more of the required MongoDB environment variables are not set.
      
      If you are using \`pnpm start\` OR you are calling the script manually with \`op run\`, please ensure you have run \`eval $(op signin)\` to authenticate with your freeCodeCamp 1password account.
      
      If you are calling the script manually without the 1password CLI, please note that you will need to set your own .env file with the required environment variables, and run the script with \`tsx --env-file=./your-env-file.env get-emails.ts ./email.csv\`.

      Please refer to the prod.env file for the required environment variables.

      If you are still having trouble, please contact Naomi for assistance.
      `);
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
  console.error(`Oh dear! Something has gone catastrophically wrong! Please contact Naomi for assistance.`)
  console.error(err);
  process.exit(1);
});
