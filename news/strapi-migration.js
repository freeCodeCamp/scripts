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
  let newTags = {};
  for (const tag of tags) {
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
    } else {
      const json = await res.json();
      newTags[tag.slug] = json.data.id;
    }
  }

  return newTags;
}

async function fetchGhostUsers() {
  let users = await api.users.browse({ limit: 100, include: "roles" });

  const modifiedUsers = [
    ...users.map((user) => {
      return {
        name: user.name,
        slug: user.slug,
        email: user.email,
        location: user.location ?? "",
        website: user.website ?? "",
        facebook: user.facebook ?? "",
        twitter: user.twitter ?? "",
        bio: user.bio ?? "",
        roles: user.roles,
      };
    }),
  ];

  while (users.meta.pagination.pages > users.meta.pagination.page) {
    users = await api.users.browse({
      limit: 100,
      page: users.meta.pagination.page + 1,
      include: "roles",
    });
    modifiedUsers.push(
      ...users.map((user) => {
        return {
          name: user.name,
          slug: user.slug,
          email: user.email,
          location: user.location ?? "",
          website: user.website ?? "",
          facebook: user.facebook ?? "",
          twitter: user.twitter ?? "",
          bio: user.bio ?? "",
          roles: user.roles,
        };
      })
    );
  }

  fs.writeFileSync("./users.json", JSON.stringify(modifiedUsers, null, 2));

  return modifiedUsers;
}

async function uploadUsersToCMS(users) {
  let newUsers = {};
  const rolesRes = await fetch(
    `${process.env.STRAPI_API_URL}/users-permissions/roles`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.STRAPI_ACCESS_TOKEN}`,
      },
    }
  );

  const rolesData = (await rolesRes.json()).roles;
  const roles = rolesData.reduce((acc, role) => {
    acc[role.name] = role.id;
    return acc;
  }, {});

  for (const user of users) {
    const data = {
      username: user.email,
      name: user.name,
      slug: user.slug,
      email: user.email,
      location: user.location ?? "",
      website: user.website ?? "",
      facebook: user.facebook ?? "",
      twitter: user.twitter ?? "",
      bio: user.bio ?? "",
      role:
        user.roles[0].name === "Contributor"
          ? roles["Contributor"]
          : roles["Editor"],
      confirmed: true,
      provider: "auth0",
      password: "password",
    };

    await fetch(`${process.env.STRAPI_API_URL}/invited-users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.STRAPI_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        data: {
          email: data.email,
          role: [data.role],
        },
      }),
    });

    const res = await fetch(`${process.env.STRAPI_API_URL}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.STRAPI_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      console.log(res.status, res.statusText, user.name);
      const json = await res.json();
      console.log(json);
    } else {
      const json = await res.json();
      newUsers[user.slug] = json.id;
    }
  }

  return newUsers;
}

async function fetchGhostPosts() {
  let posts = await api.posts.browse({ formats: "html", limit: 25 });

  const modifiedPosts = [
    ...posts.map((post) => {
      return {
        id: post.id,
        slug: post.slug,
        title: post.title,
        uuid: post.uuid,
        html: post.html,
        status: post.status,
        published_at: post.published_at,
        tags: post.tags,
        authors: post.authors,
        primary_tag: post.primary_tag,
        primary_author: post.primary_author,
      };
    }),
  ];

  while (posts.meta.pagination.pages > posts.meta.pagination.page) {
    posts = await api.posts.browse({
      formats: "html",
      limit: 25,
      page: posts.meta.pagination.page + 1,
    });
    modifiedPosts.push(
      ...posts.map((post) => {
        return {
          id: post.id,
          slug: post.slug,
          title: post.title,
          uuid: post.uuid,
          html: post.html,
          status: post.status,
          published_at: post.published_at,
          tags: post.tags,
          authors: post.authors,
          primary_tag: post.primary_tag,
          primary_author: post.primary_author,
        };
      })
    );
  }

  fs.writeFileSync("./posts.json", JSON.stringify(modifiedPosts, null, 2));

  return modifiedPosts;
}

async function migrate() {
  // Migrate tags
  const ghostTags = await fetchGhostTags();
  console.log("Tags fetched from Ghost.");
  const strapiTags = await uploadTagsToCMS(ghostTags);
  console.log("Tags uploaded to Strapi.");

  // Migrate users
  const ghostUsers = await fetchGhostUsers();
  console.log("Users fetched from Ghost.");
  const strapiUsers = await uploadUsersToCMS(ghostUsers);
  console.log("Users uploaded to Strapi.");

  // Migrate posts
  const ghostPosts = await fetchGhostPosts();
  console.log("Posts fetched from Ghost.");
  // Migrate pages
}

migrate();
