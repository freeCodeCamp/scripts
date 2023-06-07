import fetch from "node-fetch";

import { globalConfig } from "../config/globalConfig";
import { Credentials } from "../interfaces/Credentials";
import { GithubContributor } from "../interfaces/github/GitHubContributor";
import { GitHubPull } from "../interfaces/github/GitHubPull";
import { GitHubUser } from "../interfaces/github/GitHubUser";
import { logHandler } from "../utils/logHandler";

const parseGitHubCommits = async (
  credentials: Credentials,
  data: GitHubPull[]
): Promise<GithubContributor[]> => {
  const contributors: GithubContributor[] = [];
  for (const pull of data) {
    if (!pull.user) {
      continue;
    }
    const target = contributors.find((el) => el.username === pull.user.login);
    if (target) {
      target.mergedPrs++;
    } else {
      const userResponse = await fetch(pull.user.url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-GitHub-Media-Type": "github.v3",
          Authorization: "token " + credentials.githubToken,
        },
      });
      const user: GitHubUser = await userResponse.json();
      contributors.push({
        username: user.login,
        name: user.name,
        mergedPrs: 1,
        url: user.html_url,
        email: user.email,
      });
    }
  }
  return contributors;
};

/**
 * Module to fetch commits to the default branch of the learn repository,
 * aggregate those commits, and return a list of contributors based on the
 * commits they made.
 *
 * @param {Credentials} credentials The credentials data from the ENV.
 * @returns {Promise<GithubContributor[]>} A list of contributors sorted by number of commits.
 */
export const getGitHubContributions = async (
  credentials: Credentials
): Promise<GithubContributor[]> => {
  try {
    let page = 1;

    const totalData: GitHubPull[] = [];

    logHandler.log("info", `Fetching page ${page}`);

    let rawData = await fetch(
      `https://api.github.com/repos/freeCodeCamp/freeCodeCamp/pulls?state=closed&page=${page}&per_page=100`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-GitHub-Media-Type": "github.v3",
          Authorization: "token " + credentials.githubToken,
        },
      }
    );

    let parsedData: GitHubPull[] = await rawData.json();

    totalData.push(...parsedData.filter((issue) => issue.merged_at));

    while (
      new Date(parsedData[parsedData.length - 1].created_at) >
      new Date(globalConfig.start)
    ) {
      page++;
      logHandler.log(
        "info",
        `Fetching page ${page} - Looking at ${
          parsedData[parsedData.length - 1].created_at
        }`
      );
      rawData = await fetch(
        `https://api.github.com/repos/freeCodeCamp/freeCodeCamp/pulls?state=closed&page=${page}&per_page=100`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "X-GitHub-Media-Type": "github.v3",
            Authorization: "token " + credentials.githubToken,
          },
        }
      );
      parsedData = await rawData.json();
      totalData.push(...parsedData.filter((issue) => issue.merged_at));
    }

    logHandler.log(
      "info",
      `Finished with PR created at ${
        parsedData[parsedData.length - 1].created_at
      }`
    );

    logHandler.log("info", "Parsing data");

    const parsed = await parseGitHubCommits(credentials, totalData);

    return parsed.sort((a, b) => b.mergedPrs - a.mergedPrs);
  } catch (err) {
    logHandler.log("error", err);
    process.exit(1);
  }
};
