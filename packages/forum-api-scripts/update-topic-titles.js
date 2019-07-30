const fs = require('fs');
const { makeRequest } = require('./make-request');
const { delay } = require('./delay');

const data = fs.readFileSync('./data/forum-topics-and-challenge-files-matrix.json', 'utf8');
const matchedForumTopics = JSON.parse(data).matches;
const topicUpdateStatuses = {};

(async () => {
  for (let { title, forumTopicId} of matchedForumTopics){
    const bodyObj = {
      title
    };

    const actionDesc = "update title";
    const endPoint = `t/-/${forumTopicId}`;
    const method = 'put';

    /*
    const result = await makeRequest({ actionDesc, method, endPoint, bodyObj, forumTopicId });
    
    if (result.errors) {
      topicUpdateStatuses[forumTopicId] = { updateTitle: false, errors: result.errors };
    } else if (result) {
      topicUpdateStatuses[forumTopicId] = { updateTitle: true };
    }

    await delay();
    */
  }
  const successfulUpdates = Object
    .keys(topicUpdateStatuses)
    .filter(forumTopicId => {
      return topicUpdateStatuses[forumTopicId].updateTitle
    });
  console.log('matchedForumTopics: ' + matchedForumTopics.length);  
  console.log('sucessful updates: ' + successfulUpdates.length);
})();



