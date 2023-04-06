require('dotenv').config();

const { MongoClient } = require('mongodb');
const ora = require('ora');

const { MONGODB_URI } = process.env;

async function main() {
  const uri =
    MONGODB_URI ||
    'mongodb://localhost:27017/freecodecamp?retryWrites=true&w=majority';
  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    poolSize: 500
  });

  await client.connect();
  await getDuplicateUsernames(client);
}

main().catch(console.error);

async function getDuplicateUsernames(client) {
  const pipeline = [
    {
      $sort: { username: 1 }
    },
    {
      $match: {
        username: { $exists: true },
        username: { $ne: '' },
        username: { $ne: null }
      }
    },
    {
      $group: {
        _id: '$username',
        dups: { $addToSet: { user_id: '$_id', email: '$email' } },
        count: { $sum: 1 }
      }
    },
    {
      $match: { count: { $gt: 1 } }
    },
    {
      $out: 'duplicateUsernames'
    }
  ];

  const options = {
    allowDiskUse: true,
    maxTimeMS: 0,
    hint: 'username_1',
    comment: 'duplicates',
    bypassDocumentValidation: true
  };

  const spinner = ora('Aggregating...');
  spinner.start();

  const cursor = client
    .db('freecodecamp')
    .collection('user')
    .aggregate(pipeline, options);

  await cursor.toArray().then(() => {
    client.close();
    spinner.succeed('done.');
  });
}
