const fetch = require('node-fetch');
const { headers } = require('./headers');

const makeRequest = async ({ actionDesc, method, endPoint, bodyObj, forumTopicId }) => {
  const updateTopicUrl = process.env.BASE_URL + endPoint;
  const response = await fetch(updateTopicUrl, {
    headers,
    method,
    body: JSON.stringify(bodyObj)
  });
  const result = await response.json()

  if (result.errors) {
    console.log(`forumTopicId ${forumTopicId} - ${actionDesc} had an error`);
    console.log(`error_type: ${result.error_type}`);
    console.log(result.errors);
  }
  console.log(`forumTopicId ${forumTopicId} - ${actionDesc} was successful`);
};

module.exports = { makeRequest };