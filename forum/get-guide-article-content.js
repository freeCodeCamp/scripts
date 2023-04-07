const fs = require('fs');

const getGuideArticleContent = guideFilePath => {
  const content = fs.readFileSync(guideFilePath, 'utf8');
  const regex = /---\r?\n[\s\S]*?title: [\s\S]*?\r?\n---\s*\r?\n(?<content>[\s\S]+)/
  const match = content.match(regex);
  if (match) {
    const { groups: { content } } = match;
    return content;
  } else {
    return null;
  }
};

module.exports = { getGuideArticleContent };