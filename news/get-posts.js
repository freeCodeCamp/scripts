require('dotenv').config();

const GhostAdminAPI = require('@tryghost/admin-api');
const { wait } = require('./utils');
const fs = require('fs');

const lang = 'en';

const keys = {
  en: {
    api: {
      url: process.env.NEWS_API_URL,
      key: process.env.NEWS_API_ADMIN_KEY,
      version: process.env.NEWS_API_VERSION || 'v2',
    }
  },
  zh: {
    api: {
      url: process.env.ZH_NEWS_API_URL,
      key: process.env.ZH_NEWS_API_ADMIN_KEY,
      version: process.env.ZH_NEWS_API_VERSION || 'v2',
    }
  },
};

const langKeys = { ...keys[lang].api };

const api = new GhostAdminAPI({
  ...langKeys
});

const dasherize = name => {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s/g, '-')
    .replace(/[^a-z\d\-.]/g, '');
}

const constructIndex = async () => {
  let currPage = 1;
  let lastPage = 5;
  const posts = [];

  while (currPage && currPage <= lastPage) {
    const data = await api.posts.browse({ include: ['tags', 'authors'], filter: 'status:published', page: currPage });

    data.forEach(post => {
      const currProfileImg = post.primary_author.profile_image;
      const profileImageUrl = (currProfileImg && currProfileImg.includes('//www.gravatar.com/avatar/')) ? `https:${currProfileImg}` : currProfileImg;

      const thisPost = {
        objectID: post.id,
        title: post.title,
        author: {
          name: post.primary_author.name,
          url: post.primary_author.url,
          profileImage: profileImageUrl
        },
        tags: post.tags.map(tag => {
          return {
            name: tag.name,
            url: tag.url.includes('404') ? `${langKeys.url}/tag/${dasherize(tag.name)}/` : tag.url
          }
        }),
        url: post.url,
        featureImage: post.feature_image,
        publishedAt: post.published_at,
        publishedAtTimestamp: new Date(post.published_at).getTime() / 1000 | 0
      }

      posts.push(thisPost);
    });

    currPage = data.meta.pagination.next;
    lastPage = data.meta.pagination.pages;

    console.log(posts);

    fs.writeFileSync(`${lang}-posts.json`, JSON.stringify(posts, null, 2));
    await wait(.5);
  }
}

constructIndex();
