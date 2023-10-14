require("dotenv").config();
const fs = require("fs");
const GhostAdminAPI = require("@tryghost/admin-api");

const api = new GhostAdminAPI({
  url: process.env.NEWS_API_URL,
  key: process.env.NEWS_API_ADMIN_KEY,
  version: "v3",
});

async function fetchGhostTags() {
  let tags = await api.tags.browse({ limit: 100 });

  const modifiedTags = [
    ...tags.map((tag) => {
      return {
        id: tag.id,
        name: tag.name,
        slug: tag.slug,
        visibility: tag.visibility,
        count: tag.count?.posts,
      };
    }),
  ];

  while (tags.meta.pagination.pages > tags.meta.pagination.page) {
    tags = await api.tags.browse({
      limit: 100,
      page: tags.meta.pagination.page + 1,
    });
    modifiedTags.push(
      ...tags.map((tag) => {
        return {
          name: tag.name,
          slug: tag.slug,
          visibility: tag.visibility,
        };
      })
    );
  }

  fs.writeFileSync("./tags.json", JSON.stringify(modifiedTags, null, 2));

  return modifiedTags;
}

async function uploadTagsToCMS(tags) {
  tags.forEach(async (tag) => {
    const data = {
      data: {
        name: tag.name,
        slug: tag.slug,
        visibility: tag.visibility,
      },
    };

    const res = await fetch(`${process.env.STRAPI_API_URL}/tags`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.STRAPI_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      console.log(res.status, res.statusText, tag.name);
    }
  });
}

async function migrate() {
  // Migrate tags
  const tags = await fetchGhostTags();
  console.log("Tags fetched from Ghost.");
  await uploadTagsToCMS(tags);
  console.log("Tags uploaded to Strapi.");

  // Migrate authors
  // Migrate posts
  // Migrate pages
}

migrate();
