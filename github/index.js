require('dotenv').config();
const { Octokit } = require('@octokit/rest');

const {
  GITHUB_ORG,
  GITHUB_PAT,
  GITHUB_TEAM_SLUG,
  GITHUB_TEAM_PERMISSION
} = process.env;

const octokit = new Octokit({ auth: GITHUB_PAT });

const getAllActiveRepos = async () => {
  const methodProps = {
    org: GITHUB_ORG,
    sort: 'full_name',
    direction: 'asc',
    per_page: 100
  };

  const allRepos = await octokit.paginate(
    octokit.repos.listForOrg,
    methodProps
  );
  const activeRepos = allRepos
    .filter((repo) => !repo.archived)
    .map((repo) => repo.name);

  return activeRepos;
};

const addTeamToRepos = async (repos) => {
  let failedRepos = [];
  for (let repo of repos) {
    const result = await octokit.request(
      'PUT /orgs/{org}/teams/{team_slug}/repos/{owner}/{repo}',
      {
        org: GITHUB_ORG,
        team_slug: GITHUB_TEAM_SLUG,
        owner: GITHUB_ORG,
        repo: repo,
        permission: GITHUB_TEAM_PERMISSION
      }
    );
    const { status } = result;
    if (status && status === 204) {
      console.log(`Team added sucessfully to repository: ${repo}`);
    } else {
      failedRepos.push(repo);
    }
  }
  if (failedRepos.length) {
    console.log(`Failed adding the team to these repos:`);
    failedRepos.map((failedRepo) => console.log(failedRepo));
  }
};

(async () => {
  console.log(`Fetching all active repositories for "${GITHUB_ORG}"...`);
  const repos = await getAllActiveRepos(GITHUB_ORG);
  console.log(`Found ${repos.length} repos`);

  console.log(
    `Add the team: "${GITHUB_TEAM_SLUG}" to ${repos.length} repos with the permission: "${GITHUB_TEAM_PERMISSION}"`
  );

  await addTeamToRepos(repos);
  console.log(`Completed adding team to all repos.`);
})();
