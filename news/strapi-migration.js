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

  fs.writeFileSync("./tags-new.json", JSON.stringify(newTags, null, 2));

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
        profile_image: user.profile_image,
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
          profile_image: user.profile_image,
        };
      })
    );
  }

  fs.writeFileSync("./users.json", JSON.stringify(modifiedUsers, null, 2));

  return modifiedUsers;
}

async function uploadUsersToCMS(users) {
  let newUsers = {};
  let count = 0;

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
          accepted: true,
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
    const json = await res.json();

    if (!res.ok) {
      console.log(res.status, res.statusText, user.name);
      console.log(json);
    } else {
      newUsers[user.slug] = json.id;
    }

    if (user.profile_image) {
      // Fetch and upload user profile image
      const userImage = await fetch(user.profile_image);
      const userImageBlob = await userImage.blob();
      const formData = new FormData();

      formData.append("files", userImageBlob, user.slug);
      formData.append("ref", "plugin::users-permissions.user");
      formData.append("refId", json.id);
      formData.append("field", "profile_image");

      const imageRes = await fetch(`${process.env.STRAPI_API_URL}/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.STRAPI_ACCESS_TOKEN}`,
        },
        body: formData,
      });
      const imageJson = await imageRes.json();

      if (!imageRes.ok) {
        console.log(imageRes.status, imageRes.statusText, user.name);
        console.log(imageJson);
      }
    }

    count++;
    if (count % 20 === 0) {
      console.log(`${count}/${users.length} users migrated.`);
    }
  }

  fs.writeFileSync("./users-new.json", JSON.stringify(newUsers, null, 2));

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
        created_at: post.created_at,
        updated_at: post.updated_at,
        published_at: post.published_at,
        tags: post.tags,
        authors: post.authors,
        primary_author: post.primary_author,
        feature_image: post.feature_image,
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
          created_at: post.created_at,
          updated_at: post.updated_at,
          published_at: post.published_at,
          tags: post.tags,
          authors: post.authors,
          primary_author: post.primary_author,
          feature_image: post.feature_image,
        };
      })
    );
  }

  fs.writeFileSync("./posts.json", JSON.stringify(modifiedPosts, null, 2));

  return modifiedPosts;
}

async function uploadPostsToCMS(posts, tags, authors) {
  posts = JSON.parse(fs.readFileSync("./posts.json"));
  tags = JSON.parse(fs.readFileSync("./tags-new.json"));
  authors = JSON.parse(fs.readFileSync("./users-new.json"));

  let count = 0;

  for (const post of posts) {
    const data = {
      data: {
        title: post.title,
        slug: post.slug,
        body: post.html,
        created_at: post.created_at,
        updated_at: post.updated_at,
        publishedAt: post.status === "draft" ? null : post.published_at,
        tags: post.tags.map((tag) => tags[tag.slug]),
        author: authors[post.primary_author.slug],
      },
    };

    const res = await fetch(`${process.env.STRAPI_API_URL}/posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.STRAPI_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      console.log(res.status, res.statusText, post.title);
      const json = await res.json();
      console.log(json);
    }

    count++;
    if (count % 50 === 0) {
      console.log(`${count}/${posts.length} posts migrated.`);
    }
  }
}

async function migrate() {
  // Migrate tags
  // const ghostTags = await fetchGhostTags();
  // console.log("Tags fetched from Ghost.");
  // const strapiTags = await uploadTagsToCMS(ghostTags);
  // console.log("Tags uploaded to Strapi.");

  // Migrate users
  // const ghostUsers = await fetchGhostUsers();
  // console.log("Users fetched from Ghost.");
  const strapiUsers = await uploadUsersToCMS();
  console.log("Users uploaded to Strapi.");

  // Migrate posts
  // const ghostPosts = await fetchGhostPosts();
  // console.log("Posts fetched from Ghost.");
  // await uploadPostsToCMS(ghostPosts, strapiTags, strapiUsers);
  // await uploadPostsToCMS([], [], []);
  // console.log("Posts uploaded to Strapi.");

  // Migrate pages
}

migrate();
