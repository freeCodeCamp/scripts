import GhostAdminApi from "@tryghost/admin-api";
import GhostContentAPI, {
  GhostContentAPIOptions,
  PostsOrPages,
} from "@tryghost/content-api";

import { globalConfig } from "../config/globalConfig";
import { Credentials } from "../interfaces/Credentials";
import { NewsContributor } from "../interfaces/news/NewsContributor";
import { logHandler } from "../utils/logHandler";

const parseNewsData = async (
  credentials: Credentials,
  data: PostsOrPages
): Promise<{ news: NewsContributor[]; urls: string[] }> => {
  const api = new GhostAdminApi({
    url: "https://freecodecamp.org/news",
    key: credentials.ghostAdminKey,
    version: "v3",
  });
  const results: NewsContributor[] = [];
  const staffUrls: string[] = [];
  for (const datum of data) {
    if (!datum.primary_author || !datum.primary_author.name) {
      continue;
    }
    const name = datum.primary_author.name;
    const username = datum.primary_author.slug;
    const url = datum.primary_author.url || "https://freecodecamp.org/news";
    const exists = results.find((el) => el.name === name);

    if (exists) {
      exists.posts++;
    } else {
      const user = await api.users.read({ id: datum.primary_author.id });
      results.push({ name, username, url, posts: 1, email: user.email });
      staffUrls.push(`https://freecodecamp.org/news/ghost/#/staff/${username}`);
    }
  }
  return { news: results, urls: staffUrls };
};

/**
 * Module to query posts from Ghost and aggregate them into a list of contributors
 * by number of posts published.
 *
 * @param {Credentials} credentials The credentials object from the ENV.
 * @returns {Promise<NewsContributor[]>} A list of news contributors.
 */
export const getNewsData = async (
  credentials: Credentials
): Promise<{ news: NewsContributor[]; urls: string[] }> => {
  try {
    const options: GhostContentAPIOptions = {
      url: "https://freecodecamp.org/news",
      key: credentials.ghostKey,
      version: "v3",
    };

    const ghostAPI = new GhostContentAPI(options);
    const since = new Date(globalConfig.start).toISOString();
    let currentPage = 1;
    let lastPage = 5;

    logHandler.log("info", `Getting page 1 of unknown...`);

    const totalPosts = await ghostAPI.posts.browse({
      filter: `published_at:>${since}`,
      include: "authors",
      page: currentPage,
    });

    currentPage =
      totalPosts.meta.pagination.next || totalPosts.meta.pagination.pages;
    lastPage = totalPosts.meta.pagination.pages;

    while (currentPage && currentPage < lastPage) {
      logHandler.log("info", `Getting page ${currentPage} of ${lastPage}...`);
      const postData = await ghostAPI.posts.browse({
        filter: `published_at:>${since}`,
        include: "authors",
        page: currentPage,
      });
      totalPosts.push(...postData);
      currentPage =
        postData.meta.pagination.next || postData.meta.pagination.pages;
      lastPage = postData.meta.pagination.pages;
    }

    const result = await parseNewsData(credentials, totalPosts);
    return result;
  } catch (err) {
    logHandler.log("error", err);
    process.exit(1);
  }
};
