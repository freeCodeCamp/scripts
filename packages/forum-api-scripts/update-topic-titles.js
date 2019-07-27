const { makeRequest } = require('./make-request');

const bodyObj = {
  "title": "yet another title change"
}
const topic_id = 298262;
const actionDesc = "update title";
const endPoint = `t/-/${topic_id}`;
const method = 'put';

makeRequest({ actionDesc, method, endPoint, bodyObj, topic_id });
