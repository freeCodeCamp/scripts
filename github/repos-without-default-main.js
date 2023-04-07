/* 
The array of all the repos can be fetched with the below GraphQL query:

query myOrgRepos($queryString: String!) {
  search(query: $queryString, type: REPOSITORY, first: 100) {
    repositoryCount
    edges {
      node {
        ... on Repository {
          name
          defaultBranchRef {
            name
          }
        }
      }
    }
    pageInfo {
      endCursor
    }
  }
}

{
  "queryString": "org:freecodecamp archived:false fork:false"
}

You can then move to use the value of the endCursor in the subsequent queries like so:

query myOrgRepos($queryString: String!) {
  search(query: $queryString, type: REPOSITORY, first: 100, after: "CHANGE THIS TO THE endCursor VALUE") {
    repositoryCount
...

*/

const data = [
  // .. replace with the results (append them if needed) of the GrapghQL Query.
];

// Get repos with default branch that are not 'main'
const repos = data
  .filter((repo) => repo.node.defaultBranchRef.name !== 'main')
  .map((repo) => {
    return {
      name: repo.node.name,
      branch: repo.node.defaultBranchRef.name
    };
  });

console.log(`
Repos with default branch that is not 'main':

| Repo | Link |
| - | - |
  ${repos
    .map(
      (repo) => `| ${repo.name} | http://github.com/freecodecamp/${repo.name} |`
    )
    .join('\n')}
`);
