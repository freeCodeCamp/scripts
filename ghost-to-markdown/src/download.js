import 'dotenv/config';
import fs from 'fs';
import { join } from 'path';
import render from 'mustache';
import GhostAdminAPI from '@tryghost/admin-api';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import matter from 'gray-matter';

import MarkdownRendererFactory from '../lib/index.js';
import logger from './logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const wait = (seconds) =>
  new Promise((resolve) => setTimeout(resolve, seconds * 1000));

const apiUrl = process.env.GHOST_API_URL;
const apiKey = process.env.GHOST_API_KEY;
const apiVersion = 'v3.39';

if (!apiUrl || !apiKey) {
  logger.error(
    'GHOST_API_URL and GHOST_API_KEY must be set in the environment variables.',
    { label: 'SETUP' }
  );
  process.exit(1);
}

const api = new GhostAdminAPI({
  url: apiUrl,
  key: apiKey,
  version: apiVersion
});

function convert(doc) {
  try {
    const mobiledoc = JSON.parse(doc.mobiledoc, null, 2);

    // Use the Markdown renderer
    const renderer = new MarkdownRendererFactory({
      postSlug: doc.postSlug,
      authorSlug: doc.authorSlug
    }).render(mobiledoc);
    let markdown = renderer;

    markdown = matter.stringify(markdown, doc.metadata);

    return markdown;
  } catch (error) {
    logger.error(
      `Cannot convert -*- Slug: '${doc.slug}' -*- Error: ${error.message}`,
      {
        label: 'CNVRT'
      }
    );
    return '';
  }
}

function getPostMetadata(post) {
  const { title, published_at, slug, feature_image, primary_author, tags } =
    post;

  const metadata = {
    title,
    slug,
    publishedAt: published_at,
    featureImage: feature_image,
    author: {
      name: primary_author.name,
      slug: primary_author.slug
    },
    tags: tags.map((tag) => ({
      name: tag.name,
      slug: tag.slug
    }))
  };

  return metadata;
}

function savePostAsMarkdown(post) {
  try {
    const doc = {
      metadata: getPostMetadata(post),
      title: post.title,
      mobiledoc: post.mobiledoc
    };
    const postStatus = post.status;
    const authorSlug = post.primary_author?.slug || 'unknown-author';
    doc.label = `${authorSlug} - ${postStatus} - ${post.slug}`;
    if (authorSlug === 'unknown-author') {
      logger.error(
        `No Author Slug -*- Post: '${post.title}' -*- Slug: '${post.slug}'`,
        {
          label: 'SPAMD'
        }
      );
    }
    const dirPath = join(__dirname, '..', '__out__', authorSlug, postStatus);

    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    const markdown = convert(doc);

    const filePath = join(dirPath, `${post.slug}.md`);
    fs.writeFileSync(filePath, markdown, 'utf8');
    // const mobileDocFilePath = join(dirPath, `${post.slug}.json`);
    // fs.writeFileSync(mobileDocFilePath, doc.mobiledoc, "utf8");
    logger.info(`Saving   -*- Post: '${post.title}' -*- Slug: '${post.slug}'`, {
      label: 'SPAMD'
    });
  } catch (error) {
    logger.error(
      `Saving   -*- Post: '${post.title}' -*- Slug: '${post.slug}' -*- Error: ${error.message}`,
      {
        label: 'SPAMD'
      }
    );
  }
}

async function fetchAndSavePostBySlug(slug) {
  try {
    const post = await api.posts.read(
      { slug: slug },
      { formats: ['html', 'mobiledoc'], include: 'authors,tags' }
    );

    logger.info(`Fetching -*- Post: '${post.title}' -*- Slug: '${slug}'`, {
      label: 'SAVSG'
    });

    savePostAsMarkdown(post);
  } catch (error) {
    logger.error(`Fetching -*- Slug: '${slug}' -*- Error: ${error.message}`, {
      label: 'SAVSG'
    });
  }
}

async function fetchAndSaveAllPosts(batchSize = 25, postType, authorSlug) {
  let currPage = 1;
  let lastPage = 1;
  let postsAdded = 0;
  let postsFailed = 0;
  const filters = [];

  if (authorSlug) {
    filters.push(`authors.slug:${authorSlug}`);
  }
  if (postType !== 'all') {
    filters.push(`status:${postType}`);
  } else {
    filters.push(`status:[draft,published]`);
  }

  while (currPage && currPage <= lastPage) {
    try {
      const data = await api.posts.browse({
        page: currPage,
        formats: ['html', 'mobiledoc'],
        limit: batchSize,
        include: 'authors,tags',
        filter: filters.join('+')
      });
      const posts = [...data];

      if (authorSlug && currPage === 1 && posts.length === 0) {
        logger.error(`No posts for Author: ${authorSlug}`, {
          label: 'SAVAL'
        });
        return;
      }

      currPage = data.meta.pagination.next;
      lastPage = data.meta.pagination.pages;

      await wait(3);

      for (let post of posts) {
        try {
          logger.info(
            `Fetching -*- Post: '${post.title}' -*- Slug: '${post.slug}' -*- ID: '${post.id}'`,
            {
              label: 'SAVAL'
            }
          );
          savePostAsMarkdown(post);
          postsAdded++;
        } catch (err) {
          logger.error(
            `Fetching -*- Post: '${post.title}' -*- Slug: '${post.slug}' -*- ID: '${post.id}' -*- Error: ${err}`,
            {
              label: 'SAVAL'
            }
          );
          postsFailed++;
        }
      }
      logger.info(
        `Completed fetching page ${
          currPage - 1
        }/${lastPage} of posts. ${postsAdded} posts added. ${postsFailed} posts failed.`,
        {
          label: 'SAVAL'
        }
      );
    } catch (error) {
      logger.error('Error fetching posts:', error, {
        label: 'SAVAL'
      });
      break;
    }
  }

  logger.info(
    `Completed seeding post type: ${postType} posts. ${postsAdded} posts added. ${postsFailed} posts failed.`,
    {
      label: 'SAVAL'
    }
  );
}

const argv = yargs(hideBin(process.argv))
  .option('slug', {
    type: 'string',
    description: 'The slug of the post to fetch and save'
  })
  .option('author-slug', {
    type: 'string',
    description: 'The slug of the author whose posts to fetch and save'
  })
  .option('post-type', {
    choices: ['published', 'draft', 'all'],
    description: 'The type of posts to fetch',
    default: 'all'
  })
  .option('batch-size', {
    type: 'number',
    description: 'Number of posts to fetch in each batch',
    default: 10
  })
  .help().argv;

if (argv.slug) {
  fetchAndSavePostBySlug(argv.slug);
} else if (argv.authorSlug) {
  fetchAndSaveAllPosts(argv.batchSize, argv.postType, argv.authorSlug);
} else {
  fetchAndSaveAllPosts(argv.batchSize, argv.postType);
}
