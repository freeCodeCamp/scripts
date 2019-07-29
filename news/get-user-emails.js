require("dotenv").config();

const fs = require("fs");
const path = require("path");

const testConfig = () => {
  if (!process.env.NEWS_API_URL || !process.env.NEWS_API_ADMIN_KEY) {
    throw "Key are not configured.";
  }
};
try {
  testConfig();
} catch (e) {
  console.log(e);
}

const GhostAdminAPI = require("@tryghost/admin-api");

const api = new GhostAdminAPI({
  url: process.env.NEWS_API_URL || "http://localhost:2368",
  version: "v2",
  key: process.env.NEWS_API_ADMIN_KEY
});

const createAuthorsDump = authors =>
  new Promise((resolve, reject) =>
    fs.writeFile(
      path.resolve(__dirname, "authors.txt"),
      JSON.stringify(authors),
      err => (err ? reject(err) : resolve())
    )
  );

const getUserEmails = () => {
  api.users
    .browse({ limit: 250 }) // <---- Not a very good idea longterm
    .then(authors => {
      // const { pages, next } = authors.meta.pagination;
      createAuthorsDump(authors.map(({ email, name }) => [email, name]));
    })
    .catch(err => console.log(err));
};

getUserEmails();
