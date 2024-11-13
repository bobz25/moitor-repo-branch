import type { PageServerLoad } from "./$types";
import { REPOS } from "$env/static/private";

export const load: PageServerLoad = async ({ fetch }) => {
  const fetchCommitInfo = async (
    owner: string,
    repo: string,
    branch: string,
  ) => {
    const response = await fetch(
      `/api/github?owner=${owner}&repo=${repo}&branch=${branch}`,
    );
    return response.json();
  };

  try {
    const reposArray: string[] = JSON.parse(REPOS);

    const repos = reposArray.map((repoString) => {
      const parts = repoString.split("/");
      if (parts.length !== 3) {
        console.error(`Invalid repo string: ${repoString}`);
        return null;
      }
      return {
        owner: parts[0],
        repo: parts[1],
        branch: parts[2],
      };
    }).filter((repo) => repo !== null);

    return {
      commits: await Promise.all(
        repos.map(async (repo) => ({
          ...repo,
          commitInfo: await fetchCommitInfo(repo.owner, repo.repo, repo.branch),
        })),
      ),
    };
  } catch (error) {
    console.error("Error parsing REPOS string:", error);
  }
};
