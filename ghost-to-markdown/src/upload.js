import 'dotenv/config';
import fs from 'fs';
import { GraphQLClient, gql } from 'graphql-request';
import winston from 'winston';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import matter from 'gray-matter';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { exit } from 'process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import logger from './logger.js';

const wait = (seconds) =>
  new Promise((resolve) => setTimeout(resolve, seconds * 1000));

const hashnodeApi = new GraphQLClient('https://gql.hashnode.com', {
  headers: {
    Authorization: `Bearer ${process.env.HASHNODE_API_TOKEN}`
  }
});

const createDraftMutation = gql`
  mutation CreateDraftPost($input: CreateDraftInput!) {
    createDraft(input: $input) {
      draft {
        id
      }
    }
  }
`;

const createPublishedMutation = gql`
  mutation PublishPost($input: PublishPostInput!) {
    publishPost(input: $input) {
      post {
        id
      }
    }
  }
`;

async function getHashnodeUserId(hashnodeSlug) {
  const query = gql`
    query User($username: String!) {
      user(username: $username) {
        id
        username
        name
      }
    }
  `;

  const res = await hashnodeApi.request(query, {
    username: hashnodeSlug
  });

  if (!res.user) {
    logger.error(`Hashnode user not found: ${hashnodeSlug}`);
    exit(1);
  }

  return res.user.id;
}

async function uploadPostsToHashnode(hashnodeUserId, ghostSlug, postType) {
  let mutation;
  let postsUploaded = 0;
  let postsFailed = 0;

  let dirPath = join(__dirname, '__out__', ghostSlug, postType);

  try {
    for (const file of fs.readdirSync(dirPath)) {
      if (!file.endsWith('.md')) {
        continue;
      }

      const filePath = join(dirPath, file);

      const { content, data: metadata } = matter.read(filePath);

      const uploadData = {
        title: metadata.title,
        slug: metadata.slug,
        contentMarkdown: content,
        publicationId: process.env.HASHNODE_PUBLICATION_ID,
        tags: metadata.tags
      };

      if (metadata.featureImage) {
        uploadData.coverImageOptions = {
          coverImageURL: metadata.featureImage
        };
      }

      if (postType === 'draft') {
        mutation = createDraftMutation;
        uploadData.draftOwner = hashnodeUserId;
      } else {
        mutation = createPublishedMutation;
        uploadData.publishAs = hashnodeUserId;
        uploadData.publishedAt = metadata.publishedAt;
      }

      try {
        await hashnodeApi.request(mutation, {
          input: uploadData
        });
        logger.info(
          `Uploaded post "${uploadData.title}" (slug: ${uploadData.slug})`
        );
        postsUploaded++;
      } catch (error) {
        logger.error(
          `Failed to upload post "${uploadData.title}" (slug: ${uploadData.slug}). Error:`,
          error
        );
        postsFailed++;
      }
      await wait(1);
    }
  } catch (error) {
    logger.error(`Error finding posts: ${error}`);
  }

  logger.info(
    `Completed uploading ${postType} posts. Uploaded: ${postsUploaded}, Failed: ${postsFailed}`
  );
}

async function upload(ghostSlug, hashnodeSlug, postType) {
  const hashnodeUserId = await getHashnodeUserId(hashnodeSlug);
  if (postType === 'all') {
    await uploadPostsToHashnode(hashnodeUserId, ghostSlug, 'draft');
    await uploadPostsToHashnode(hashnodeUserId, ghostSlug, 'published');
  } else {
    await uploadPostsToHashnode(hashnodeUserId, ghostSlug, postType);
  }
}

const argv = yargs(hideBin(process.argv))
  .option('ghost-slug', {
    type: 'string',
    description: 'The slug of the author in ghost'
  })
  .option('hashnode-slug', {
    type: 'string',
    description: 'The slug of the author in hashnode'
  })
  .option('post-type', {
    choices: ['published', 'draft', 'all'],
    description: 'The type of posts to upload',
    default: 'published'
  })
  .demandOption(
    ['ghost-slug', 'hashnode-slug'],
    'Please provide both ghost-slug and hashnode-slug of the author to upload posts'
  )
  .help().argv;

if (argv.ghostSlug && argv.hashnodeSlug) {
  upload(argv.ghostSlug, argv.hashnodeSlug, argv.postType);
}
