import "dotenv/config";
import fs from "fs";
import { GraphQLClient, gql } from "graphql-request";
import winston from "winston";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import matter from "gray-matter";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} ${level}: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "upload.log" }),
  ],
});

const hashnodeApi = new GraphQLClient("https://gql.hashnode.com", {
  headers: {
    Authorization: `Bearer ${process.env.HASHNODE_API_TOKEN}`,
  },
});

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
    username: hashnodeSlug,
  });

  if (!res.user) {
    logger.error(`User not found: ${hashnodeSlug}`);
    throw new Error(`User not found: ${hashnodeSlug}`);
  }

  return res.user.id;
}

async function uploadPostsToHashnode(hashnodeUserId, ghostSlug, postType) {
  const createDraftMutation = gql`
    mutation CreateDraftPost($input: CreateDraftInput!) {
      createDraft(input: $input) {
        draft {
          id
          slug
          title
          subtitle
          author {
            id
            username
            name
          }
        }
      }
    }
  `;
  const createPublishedMutation = gql`
    mutation PublishPost($input: PublishPostInput!) {
      publishPost(input: $input) {
        post {
          id
          slug
          title
          author {
            id
            username
            name
          }
        }
      }
    }
  `;

  const { content, data: metadata } = matter.read("./sample.md", "utf8");

  const data = {
    title: metadata.title,
    slug: metadata.slug,
    contentMarkdown: content,
    publicationId: process.env.HASHNODE_PUBLICATION_ID,
    draftOwner: hashnodeUserId,
  };

  const res = await hashnodeApi.request(createDraftMutation, {
    input: data,
  });
  console.log(`Post uploaded successfully`);
}

async function upload(ghostSlug, hashnodeSlug, postType) {
  const hashnodeUserId = await getHashnodeUserId(hashnodeSlug);
  await uploadPostsToHashnode(hashnodeUserId, ghostSlug, postType);
}

const argv = yargs(hideBin(process.argv))
  .option("ghost-slug", {
    type: "string",
    description: "The slug of the author in ghost",
  })
  .option("hashnode-slug", {
    type: "string",
    description: "The slug of the author in hashnode",
  })
  .option("post-type", {
    choices: ["published", "draft", "all"],
    description: "The type of posts to upload",
    default: "published",
  })
  .demandOption(
    ["ghost-slug", "hashnode-slug"],
    "Please provide both ghost-slug and hashnode-slug of the author to upload posts"
  )
  .help().argv;

if (argv.ghostSlug && argv.hashnodeSlug) {
  upload(argv.ghostSlug, argv.hashnodeSlug, argv.postType);
}
