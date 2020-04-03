require("dotenv").config();

const fs = require("fs");
const path = require("path");

const keys = {
  user: {
    role: process.env.NEWS_API_USER_ROLE || "Author",
  },
  api: {
    url: process.env.NEWS_API_URL,
    key: process.env.NEWS_API_ADMIN_KEY,
    version: process.env.NEWS_API_VERSION || "v2"
  }
}

const GhostAdminAPI = require("@tryghost/admin-api");

const api = new GhostAdminAPI({
  ...keys.api
});

const createAuthorsDump = (authors) =>
  new Promise((resolve, reject) =>
    fs.writeFile(
      path.resolve(__dirname, keys.user.role + ".json"),
      JSON.stringify(authors),
      (err) => (err ? reject(err) : resolve())
    )
  );

const getUserEmails = () => {
  api.users
    .browse({ include: "roles", limit: "all" })
    .then((users) => {
      createAuthorsDump(
        users
          .map((user) => {
            const { email, name: authorName, roles } = user;
            return roles.map(({ name: roleName }) =>
              roleName === keys.user.role
                ? { email, name: authorName }
                : null
            );
          })
          .reduce((acc, cur) => acc.concat(cur))
          .filter((user) => !!user)
      );
    })
    .catch((err) => console.log(err));
};

getUserEmails();
