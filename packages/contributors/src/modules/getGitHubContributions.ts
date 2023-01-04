import fetch from "node-fetch";

import { globalConfig } from "../config/globalConfig";
import { Credentials } from "../interfaces/Credentials";
import { GitHubCommit } from "../interfaces/github/GitHubCommit";
import { GithubContributor } from "../interfaces/github/GitHubContributor";
import { logHandler } from "../utils/logHandler";

const parseGitHubCommits = (data: GitHubCommit[]): GithubContributor[] => {
  const contributors: GithubContributor[] = [];
  for (const commit of data) {
    if (!commit.author || !commit.commit.author) {
      continue;
    }
    const target = contributors.find(
      (el) => el.username === commit.author.login
    );
    if (target) {
      target.commits++;
    } else {
      contributors.push({
        username: commit.author.login,
        name: commit.commit.author.name,
        commits: 1,
        url: commit.author.html_url,
        email: commit.commit.author.email,
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
    const since = new Date(globalConfig.start).toISOString();

    let page = 1;

    const totalData: GitHubCommit[] = [];

    logHandler.log("info", `Fetching page ${page}`);

    let rawData = await fetch(
      `https://api.github.com/repos/freeCodeCamp/freeCodeCamp/commits?since=${since}&page=${page}&per_page=100`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-GitHub-Media-Type": "github.v3",
          Authorization: "token " + credentials.githubToken,
        },
      }
    );

    let parsedData: GitHubCommit[] = await rawData.json();

    totalData.push(...parsedData);

    while (parsedData.length === 100) {
      page++;
      logHandler.log("info", `Fetching page ${page}`);
      rawData = await fetch(
        `https://api.github.com/repos/freeCodeCamp/freeCodeCamp/commits?since=${since}&page=${page}&per_page=100`,
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
      totalData.push(...parsedData);
    }

    logHandler.log("info", "Parsing data");

    return parseGitHubCommits(totalData).sort((a, b) => b.commits - a.commits);
  } catch (err) {
    logHandler.log("error", err);
    process.exit(1);
  }
};
