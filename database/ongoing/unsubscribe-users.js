const getItems = require('../utils/get-items');
const asyncForEach = require('../utils/async-for-each');
const { logger, generateProgressBar } = require('../utils/logging');

module.exports = {
  async up(db, client) {
    const emails = getItems('bouncing-emails.csv');
    const progress = generateProgressBar(emails.length);
    await asyncForEach(emails, async (email, index) => {
      const log = (m, p, t = 'info') => logger(t, index, m, p);
      log('Query out: ', email);
      progress.tick();
      await db
        .collection('user')
        .updateOne(
          { email: email },
          { $set: { sendQuincyEmail: false } },
          async (err, result) => {
            if (err) {
              log('ERRORED migrating: ', email, 'error');
              return;
            }
            const { modifiedCount } = result;
            modifiedCount
              ? log('Success migrating: ', email)
              : log('Failure migrating: ', email);
          }
        );
    });
    progress.end();
  },

  async down(db, client) {
    // TODO write the statements to rollback your migration (if possible)
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
  }
};
