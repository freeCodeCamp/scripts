const fs = require('fs');
const { delay } = require('./delay');
const { getGuideArticleContent } = require('./get-guide-article-content');
const { updateTopic } = require('./update-topic');

const data = fs.readFileSync('./data/forum-topics-and-challenge-files-matrix.json', 'utf8');
const matchedForumTopics = JSON.parse(data).matches;
const scriptResults = [];

(async () => {
  for (let { title, forumTopicId} of matchedForumTopics) {
    const result = await updateTopic(forumTopicId, title, guideArticleContent);
    let toLog = { forumTopicId, challengeTitle, challengeFilePath, status: result.status };
    if (result.status !== 'success') {
      toLog = { ...toLog, errors: result.errors }
      console.log('topic_id ' + forumTopicId + ' had issues while trying to update');
      console.log(result.errors);
      console.log();
    }
    scriptResults.push(toLog);
    await delay(4000);
  }

  fs.writeFileSync(
    './data/forum-topics-update-log.json',
    JSON.stringify(scriptResults, null, '  '),
    'utf8'
  );
  
  //count the number of successful updates
  const successfulUpdates = scriptResults.filter(({ status }) => status);
  console.log('matchedForumTopics: ' + matchedForumTopics.length);  
  console.log('sucessful updates: ' + successfulUpdates.length);
})();



