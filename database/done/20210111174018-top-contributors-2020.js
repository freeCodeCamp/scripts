const topContributors = require('../data/contributors');

module.exports = {
  async up(db, client) {
    console.log('Doing changes on ' + topContributors.length + ' accounts.');
    await topContributors.forEach(async (email) => {
      console.log(email);
      await db
        .collection('user')
        .updateOne(
          { email },
          { $addToSet: { yearsTopContributor: { $each: ['2020'] } } }
        );
    });
  },

  async down(db, client) {
    // TODO write the statements to rollback your migration (if possible)
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
  }
};
