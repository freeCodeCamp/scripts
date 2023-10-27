require('dotenv').config();

const GhostAdminAPI = require('@tryghost/admin-api');
const ora = require('ora');
const fs = require('fs');
const { wait, keys } = require('./utils');

let pagesAdded = 0;
let pagesFailed = 0;

const apiGetter = new GhostAdminAPI({ ...keys.getter });
const apiSetter = new GhostAdminAPI({ ...keys.setter });

const seedPages = async () => {
  let currPage = 1;
  let lastPage = 1;

  // const spinner = ora('Begin seeding pages...');
  // spinner.start();

  while (currPage && currPage <= lastPage) {
    const data = await apiGetter.pages.browse({
      page: currPage,
      formats: ['html', 'mobiledoc']
      // filter: 'authors.id:5ceb747ae17b4228e0181c33'
    });
    const pages = [...data];

    // Uncomment this when testing
    // currPage = 2;

    // Comment these two when testing
     currPage = data.meta.pagination.next;
     lastPage = data.meta.pagination.pages;

    await wait(1);

    for (let i in pages) {
      const page = pages[i];
      const {
        id,
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
      } = page;

      const primary_tag = primary_tag_v2 ? { id: primary_tag_v2.id } : null;
      const primary_author = primary_author_v2
        ? { id: primary_author_v2.id }
        : null;

      // Handle tags differently to prevent duplicate tags
      const tags = page.tags.map(({ name, slug }) => ({ name, slug }));
      const pageToAdd = {
        id,
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

        tags,
        primary_tag,

        authors,
        primary_author
      };

      await apiSetter.pages
        .add(pageToAdd)
        .then(({ slug }) => {
          // spinner.text = `Seeded page: ${title}`;
          console.log(slug);
          fs.appendFileSync(
            'passed-pages.log',
            `{
  "time": "${new Date()}",
  "id": "${pageToAdd.id}",
  "slug": "${slug}"
},
`,

            // "page": ${JSON.stringify(pageToAdd, null, 2)}

            { flag: 'a+', encoding: 'utf-8' }
          );
          pagesAdded++;
        })
        .catch((err) => {
          // spinner.fail = `Failed seeding: ${title}`;
          console.log('DISASTER', err);
          pagesFailed++;
          fs.appendFileSync(
            'failed-pages.log',
            `{
  "time": "${new Date()}",
  "page": ${JSON.stringify(pageToAdd, null, 2)}
  "error": ${JSON.stringify(err)}
},
`,
            { flag: 'a+', encoding: 'utf-8' }
          );
        });

	    await wait(1);
    }
  }
  console.log(
    `Complete. ${pagesAdded} pages added. ${pagesFailed} pages failed.`
  );
  // spinner.succeed('Completed seeding pages.');
};

seedPages();
