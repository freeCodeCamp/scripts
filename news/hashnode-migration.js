require("dotenv").config();
const fs = require("fs");
const GhostAdminAPI = require("@tryghost/admin-api");
const { GraphQLClient, gql } = require("graphql-request");

// const showdown = require("showdown");
// const { JSDOM } = require("jsdom");
// const htmlToMdProcessor = new showdown.Converter();

const ghostApi = new GhostAdminAPI({
  url: process.env.NEWS_API_URL,
  key: process.env.NEWS_API_ADMIN_KEY,
  version: "v3",
});

const hashnodeApi = new GraphQLClient("https://gql.hashnode.com", {
  headers: {
    Authorization: `Bearer ${process.env.HASHNODE_API_TOKEN}`,
  },
});

const GHOST_USER_SLUG = "";
const HASHNODE_USER_SLUG = "";

async function fetchGhostPosts(htmlToMdProcessor) {
  let posts = await ghostApi.posts.browse({
    formats: "html",
    limit: 25,
    filter: `status:draft+authors:${GHOST_USER_SLUG}`,
  });

  const modifiedPosts = [
    ...(await Promise.all(
      posts.map(async (post) => {
        return {
          id: post.id,
          slug: post.slug,
          title: post.title,
          html: post.html,
          markdown: String(await htmlToMdProcessor.process(post.html)),
          // markdown: htmlToMdProcessor.makeMarkdown(
          //   post.html,
          //   new JSDOM().window.document
          // ),
          status: post.status,
          created_at: post.created_at,
          updated_at: post.updated_at,
          published_at: post.published_at,
          tags: post.tags,
          authors: post.authors,
          primary_author: post.primary_author,
          feature_image: post.feature_image,
          codeinjection_head: post.codeinjection_head,
          codeinjection_foot: post.codeinjection_foot,
        };
      })
    )),
  ];
  console.log(posts.meta.pagination);

  while (posts.meta.pagination.pages > posts.meta.pagination.page) {
    posts = await ghostApi.posts.browse({
      formats: "html",
      limit: 25,
      page: posts.meta.pagination.page + 1,
      filter: `status:draft+authors:${GHOST_USER_SLUG}`,
    });
    modifiedPosts.push(
      ...(await Promise.all(
        posts.map(async (post) => {
          return {
            id: post.id,
            slug: post.slug,
            title: post.title,
            uuid: post.uuid,
            html: post.html,
            markdown: String(await htmlToMdProcessor.process(post.html)),
            // markdown: htmlToMdProcessor.makeMarkdown(
            //   post.html,
            //   new JSDOM().window.document
            // ),
            status: post.status,
            created_at: post.created_at,
            updated_at: post.updated_at,
            published_at: post.published_at,
            tags: post.tags,
            authors: post.authors,
            primary_author: post.primary_author,
            feature_image: post.feature_image,
            codeinjection_head: post.codeinjection_head,
            codeinjection_foot: post.codeinjection_foot,
          };
        })
      ))
    );
    console.log(posts.meta.pagination);
  }

  fs.writeFileSync(
    "./ghost-data/posts-unified.json",
    JSON.stringify(modifiedPosts, null, 2)
  );

  return modifiedPosts;
}

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

async function initUnifiedProcessor() {
  const { unified } = await import("unified");
  const { default: rehypeParse } = await import("rehype-parse");
  const { default: rehypeRemark } = await import("rehype-remark");
  const { default: remarkGfm } = await import("remark-gfm");
  const { default: remarkStringify } = await import("remark-stringify");

  return unified().use(rehypeParse).use(rehypeRemark).use(remarkGfm).use(remarkStringify);
}

async function migration() {
  const htmlToMdProcessor = await initUnifiedProcessor();
  await fetchGhostPosts(htmlToMdProcessor);
  // const userId = await getHashnodeUserId();
  // await uploadPostsToHashnode(userId);
}

migration();
