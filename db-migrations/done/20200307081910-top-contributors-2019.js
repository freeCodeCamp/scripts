const topContributors = require('../utils/contributors');

module.exports = {
  async up(db) {
    console.log('Doing changes on ' + topContributors.length + ' accounts.')
    await topContributors.forEach( async username => {
      console.log(username);
      await db.collection('user').updateOne({username}, {$addToSet: {yearsTopContributor: { $each: ['2019']}}});
    })
  },

  down(db, client) {
    // nothing here
  }
};