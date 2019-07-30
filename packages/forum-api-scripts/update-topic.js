const { makeRequest } = require('./make-request');

const updateTopic = async (forumTopicId, title, articleContent) => {
  let topicUpdateStatuses = {};

  let bodyObj = { title };

  (async () => {
    const titleResult = await makeRequest(
      { method: 'put', endPoint: `t/-/${forumTopicId}`, bodyObj }
    );
    // update status of current request
    topicUpdateStatuses = !titleResult.errors
      ? { updateTitle: true }
      : { updateTitle: false, errors: titleResult.errors }

    // make sure the update worked
    if (topicUpdateStatuses.updateTitle) {
      const getResult = await makeRequest(
        { method: 'get', endPoint: `t/${forumTopicId}/posts` }
      );

      // make sure get request for post worked
      if (!getResult.errors) {
        // prepare to update first post's content
        const [{ id: firstPostId }] = getResult.post_stream.posts;
        bodyObj = { raw: articleContent };
        const postResult = await makeRequest(
          { method: 'put', endPoint: `posts/${firstPostId}`, bodyObj });
        topicUpdateStatuses = !(postResult.errors)
          ? { ...topicUpdateStatuses, updateContent: true }
          : { ...topicUpdateStatuses, updateContent: false, errors: postResult.errors };

      } else {
        // get request for post failed
        topicUpdateStatuses = { ...topicUpdateStatuses, updateContent: false, errors: getResult.errors };
      }
    }

    const { updateTitle, updateContent, errors } = topicUpdateStatuses;
    
    return updateTitle && updateContent 
      ? { status: 'success'}
      : { status: 'failed', errors };
  })();
}

module.exports = { updateTopic }
