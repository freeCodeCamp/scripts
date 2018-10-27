'use strict';
const topContributors = require('../contributors');

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