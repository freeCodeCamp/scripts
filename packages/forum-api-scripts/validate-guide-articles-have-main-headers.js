const fs = require('fs');
const { getGuideArticleContent } = require('./get-guide-article-content');

const data = fs.readFileSync('D:/Coding/search-files/data/forum-topics-and-challenge-files-matrix.json', 'utf8');
const matchedForumTopics = JSON.parse(data).matches;

for (let { guideFilePath, title, forumTopicId } of matchedForumTopics) {
  const guideArticleContent = getGuideArticleContent(guideFilePath);
  if (guideArticleContent) {
    const regex = /\s*(?<mainHeader># .+)\r?\n/;
    const match = guideArticleContent.match(regex);
    if (!match) {
      console.log(guideFilePath);
      console.log('could not find main header');
    }
  } else {
    console.log(guideFilePath);
    console.log('could not retrieve guide content');
  }
}
console.log('script complete');

