const fetch = require('node-fetch');
const { headers } = require('./headers');

const makeRequest = async ({ method, endPoint, bodyObj }) => {
  const apiUrl = process.env.BASE_URL + endPoint;
  const body = bodyObj ? JSON.stringify(bodyObj) : undefined;
  const response = await fetch(apiUrl, {
    headers,
    method,
    body
  });
  const result = await response.json();
  return result;
};

module.exports = { makeRequest };