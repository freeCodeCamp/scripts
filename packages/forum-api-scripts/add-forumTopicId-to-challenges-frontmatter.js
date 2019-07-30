const fs = require('fs');
const data = fs.readFileSync('D:/Coding/search-files/data/forum-topics-and-challenge-files-matrix.json', 'utf8');
const matchedForumTopics = JSON.parse(data).matches;

for (let { challengeFilePath, forumTopicId } of matchedForumTopics) {
  const realPath = 'D://Coding/fcc/' + challengeFilePath;
  const content = fs.readFileSync(realPath, 'utf8');
  const regex = /(---\r?\n)([\s\S]*?)(\r?\n---)/;
  const match = content.match(regex);
  if (match && !/forumTopicId: /.test(content)) {
    const forumTopicIdProperty = `forumTopicId: ${forumTopicId}`;
    const newContent = content.replace(regex, "$1$2\n" + forumTopicIdProperty + "$3");
    fs.writeFileSync(realPath, newContent, 'utf8');
  }
  else {
    console.log('issue with')
    console.log(challengeFilePath);
    console.log();
  }
};

console.log(matchedForumTopics.length);
