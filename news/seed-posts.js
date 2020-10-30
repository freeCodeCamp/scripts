require('dotenv').config();

const GhostAdminAPI = require('@tryghost/admin-api');
const ora = require('ora');
const fs = require('fs');
const { wait } = require('./utils');

const keys = {
  getter: {
    url: process.env.GETTER_NEWS_API_URL,
    key: process.env.GETTER_NEWS_API_ADMIN_KEY,
    version: 'v2'
  },
  setter: {
    url: process.env.SETTER_NEWS_API_URL,
    key: process.env.SETTER_NEWS_API_ADMIN_KEY,
    version: 'v3'
  }
};

const apiGetter = new GhostAdminAPI({ ...keys.getter });
const apiSetter = new GhostAdminAPI({ ...keys.setter });

const seedPosts = async () => {
  let currPage = 1;
  let lastPage = 5;
  const spinner = ora('Begin seeding posts...');
  spinner.start();

  while (currPage && currPage <= lastPage) {
    const data = await apiGetter.posts.browse({
      page: currPage,
      formats: ['html', 'mobiledoc']
    });
    const posts = [...data];

    currPage = data.meta.pagination.next;
    lastPage = data.meta.pagination.pages;

    for (let i in posts) {
      const post = posts[i];
      const {
        id,
        uuid,
        title,
        slug,
        mobiledoc,
        html,
        feature_image,
        featured,
        status,
        locale,
        visibility,
        created_at,
        updated_at,
        published_at,

        primary_tag: primary_tag_v2,
        primary_author: primary_author_v2
      } = post;

      // Handle tags differently to prevent duplicate tags
      const tags = post.tags.map((tag) => {
        return ({
          id,
          name,
          slug,
          description,
          feature_image,
          visibility,
          meta_title,
          meta_description,
          created_at,
          updated_at,

          // these are new things on the v3 side so we set them to defaults
          og_image: null,
          og_title: null,
          og_description: null,
          twitter_image: null,
          twitter_title: null,
          twitter_description: null,
          codeinjection_head: null,
          codeinjection_foot: null,
          canonical_url: null,
          accent_color: null
        } = tag);
      });

      apiSetter.posts
        .add({
          id,
          uuid,
          title,
          slug,
          mobiledoc,
          html, // TODO: Skip over this using the force_rerender ??
          feature_image,
          featured,
          status,
          locale,
          visibility,
          created_at,
          updated_at,
          published_at,

          // Some of these things while available on V2 can be overriden to these values
          // because that's how we want them, for intance the canonical url should be null
          custom_excerpt: null,
          codeinjection_head: null,
          codeinjection_foot: null,
          custom_template: null,
          canonical_url: null,
          send_email_when_published: false,

          tags,
          primary_tag: { id: primary_tag_v2.id },

          authors,
          primary_author: { id: primary_author_v2.id }
        })
        .then((res) => {
          spinner.text = `Seeded post: ${title}`;
        })
        .catch((err) => {
          spinner.fail = `Failed seeding: ${title}`;
          fs.appendFileSync(
            'failed-posts.txt',
            `Title: ${title}, Id: ${id}\n`,
            { flag: 'a+', encoding: 'utf-8' }
          );
        });

      await wait(1);
    }
  }
  spinner.succeed('Completed seeding posts.');
};

seedPosts();
