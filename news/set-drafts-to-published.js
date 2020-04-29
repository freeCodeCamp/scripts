require("dotenv").config();

const keys = {
  user: {
    role: process.env.NEWS_API_USER_ROLE || "Author",
  },
  api: {
    url: process.env.NEWS_API_URL,
    key: process.env.NEWS_API_ADMIN_KEY,
    version: process.env.NEWS_API_VERSION || "v2",
  },
};

const GhostAdminAPI = require("@tryghost/admin-api");

const api = new GhostAdminAPI({
  ...keys.api,
});

const WAIT_BETWEEN_CALLS = 1; //<--------------- Change this for delay in seconds

const wait = (seconds) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(seconds);
    }, seconds * 1000);
  });
};

if (process.env.NEWS_API_URL === "https://www.freecodecamp.org/news") {
  console.log("\nWarning: Production run.\n");
  console.log("Press Ctrl + C to exit now...or wait 5 seconds to continue.\n");
  wait(5);
}

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await wait(WAIT_BETWEEN_CALLS);
    await callback(array[index], index, array);
  }
}

const setDraftPostsToPublished = async (articles) => {
  console.log("Preparing posts, total posts: " + articles.length);
  await asyncForEach(articles, async (article) => {
    let { id, updated_at, published_at, status, slug } = article;
    try {
      console.log(
        "Status: " +
          status +
          " | Published: " +
          published_at +
          " | Updated: " +
          updated_at +
          " | Slug: " +
          slug
      );
      await api.posts
        .edit({
          id,
          status: 'published',
          updated_at: new Date(updated_at).toISOString(),
        })
        .then(({ status, slug, published_at, updated_at }) =>
          console.log(
            "Status: " +
              status +
              " | Published: " +
              published_at +
              " | Updated: " +
              updated_at +
              " | Slug: " +
              slug
          )
        )
        .catch((error) => console.log(error));
    } catch (error) {
      console.log("Errored: ", slug, error);
    }
  });
};

api.posts
  .browse({
    filter: "tag:toothbrush",
    limit: "all"
  })
  .then((posts) => setDraftPostsToPublished(posts))
  .catch((err) => console.log(err));
