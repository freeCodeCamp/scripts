import "dotenv/config";
import fs from "fs";
import { GraphQLClient, gql } from "graphql-request";

const hashnodeApi = new GraphQLClient("https://gql.hashnode.com", {
  headers: {
    Authorization: `Bearer ${process.env.HASHNODE_API_TOKEN}`,
  },
});

const GHOST_USER_SLUG = "";
const HASHNODE_USER_SLUG = "nirajtest";

async function getHashnodeUserId() {
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
    username: HASHNODE_USER_SLUG,
  });

  if (!res.user) {
    console.log("User not found");
    throw new Error("User not found");
  }

  return res.user.id;
}

async function uploadPostsToHashnode(userId, posts) {
  const query = gql`
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

  const mdContent = fs.readFileSync("./sample.md", "utf8");

  const data = {
    title: "test post",
    subtitle: "this is a subtitle",
    slug: "draft-post",
    contentMarkdown: mdContent,
    publicationId: process.env.HASHNODE_PUBLICATION_ID,
    draftOwner: userId,
  };

  const res = await hashnodeApi.request(query, {
    input: data,
  });

  console.log(JSON.stringify(res));
}

async function upload() {
  const userId = await getHashnodeUserId();
  await uploadPostsToHashnode(userId);
}

upload();
