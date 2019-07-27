require('dotenv').config();

const headers = {
  'Accept': 'application/json',
  'Content-Type': 'application/json',
  'Api-Key': process.env.DISCOURSE_API_KEY,
  'Api-Username': process.env.DISCOURSE_USERNAME,
}

module.exports = { headers };