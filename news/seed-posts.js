require('dotenv').config();

const GhostAdminAPI = require('@tryghost/admin-api');
const ora = require('ora');
const fs = require('fs');
const { wait, keys } = require('./utils');

let postsAdded = 0;
let postsFailed = 0;

const apiGetter = new GhostAdminAPI({ ...keys.getter });
const apiSetter = new GhostAdminAPI({ ...keys.setter });

const seedPosts = async () => {
  let currPage = 1;
  let lastPage = 1;

  // const spinner = ora('Begin seeding posts...');
  // spinner.start();

  while (currPage && currPage <= lastPage) {
    const data = await apiGetter.posts.browse({
      page: currPage,
      formats: ['html', 'mobiledoc']
      // filter: 'authors.id:5ceb747ae17b4228e0181c33'
    });
    const posts = [...data];

    // Uncomment this when testing
    currPage = 2;

    // Comment these two when testing
    // currPage = data.meta.pagination.next;
    // lastPage = data.meta.pagination.pages;

    await wait(3);

    for (let i in posts) {
      const post = posts[i];
      const {
        id,
        uuid,
        title,
        slug,
        mobiledoc,
        // html,  // We do not need to get set this key during add calls, use force_rerender when doing edit calls
        feature_image,
        featured,
        status,
        locale,
        visibility,
        created_at,
        updated_at,
        published_at,
        authors,
        primary_tag: primary_tag_v2,
        primary_author: primary_author_v2
      } = post;

      const primary_tag = primary_tag_v2 ? { id: primary_tag_v2.id } : null;
      const primary_author = primary_author_v2
        ? { id: primary_author_v2.id }
        : null;

      // Handle tags differently to prevent duplicate tags
      const tags = post.tags.map(({ name, slug }) => ({ name, slug }));
      const postToAdd = {
        id,
        uuid,
        title,
        slug,
        mobiledoc,
        // html,  // We do not need to get set this key during add calls, use force_rerender when doing edit calls
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
        primary_tag,

        authors,
        primary_author
      };

      await apiSetter.posts
        .add(postToAdd)
        .then(({ slug }) => {
          // spinner.text = `Seeded post: ${title}`;
          console.log(slug);
          fs.appendFileSync(
            'passed-posts.log',
            `{
  "time": "${new Date()}",
  "id": "${postToAdd.id}",
  "slug": "${slug}"
},
`,

            // "post": ${JSON.stringify(postToAdd, null, 2)}

            { flag: 'a+', encoding: 'utf-8' }
          );
          postsAdded++;
        })
        .catch((err) => {
          // spinner.fail = `Failed seeding: ${title}`;
          console.log('DISASTER', err);
          postsFailed++;
          fs.appendFileSync(
            'failed-posts.log',
            `{
  "time": "${new Date()}",
  "post": ${JSON.stringify(postToAdd, null, 2)}
  "error": ${JSON.stringify(err)}
},
`,
            { flag: 'a+', encoding: 'utf-8' }
          );
        });
    }
  }
  console.log(
    `Complete. ${postsAdded} posts added. ${postsFailed} posts failed.`
  );
  // spinner.succeed('Completed seeding posts.');
};

seedPosts();
