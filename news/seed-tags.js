require('dotenv').config();

const GhostAdminAPI = require('@tryghost/admin-api');
const { wait } = require('./utils');

const keys = {
  getter: {
    url: process.env.GETTER_NEWS_API_URL,
    key: process.env.GETTER_NEWS_API_ADMIN_KEY,
    version: process.env.GETTER_NEWS_API_VERSION || 'v2',
  },
  setter: {
    url: process.env.SETTER_NEWS_API_URL,
    key: process.env.SETTER_NEWS_API_ADMIN_KEY,
    version: process.env.SETTER_NEWS_API_VERSION || 'v2',
  },
};

const apiGetter = new GhostAdminAPI({ ...keys.getter });
const apiSetter = new GhostAdminAPI({ ...keys.setter });

const seedTags = async () => {
  let currPage = 1;
  let lastPage = 5;

  while (currPage && currPage <= lastPage) {
    const data = await apiGetter.tags.browse({ page: currPage });
    const tags = [ ...data ];

    currPage = data.meta.pagination.next;
    lastPage = data.meta.pagination.pages;

    for (let i in tags) {
      const tag = tags[i];

      apiSetter.tags.add(tag)
        .then(res => res)
        .then(() => console.log(`Added tag: ${tag.name}`))
        .catch(err => console.error(err));
      
      await wait(1);
    }
  }
}

seedTags();
