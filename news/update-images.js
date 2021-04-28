require("dotenv").config();

const GhostAdminAPI = require("@tryghost/admin-api");
const { wait, keys } = require("./utils");

/**
 * postList.json should be array of objects with structure
 * {
 *   id: string;
 * }
 */
const posts = require("./postList.json");

const api = new GhostAdminAPI({ ...keys.images });

const replaceFeatured = async () => {
  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    console.log("Updating post " + post.id);
    const target = await api.posts.read({ id: post.id });
    const result = await api.posts
      .edit({
        id: post.id,
        feature_image: `https://cdn-media-2.freecodecamp.org/${post.id}.jpg`,
        updated_at: target.updated_at,
      })
      .catch((err) => console.error(err));
    await wait(2);
  }
};

(async () => {
  await replaceFeatured();
})();

// 