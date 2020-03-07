/**

// WARNING!:
// This snippet was last run using <3.0.x of migrate-mongo
// It maynot be functional.
// See: https://github.com/seppevs/migrate-mongo#example-3-call-a-callback-deprecated

'use strict';
const topContributors = require('../utils/contributors');

async function up(db, next) {
  const collection = db.collection('user');
  topContributors.forEach(username => {

    console.log(username);

    collection.updateOne(
      { username },
      {
        $set:{
          yearsTopContributor: ['2018']
        }
      },
      next
    );


  });
}

function down(db, next) {
  return next();
}

module.exports = {
  up,
  down
};

*/