import { json } from "@sveltejs/kit";
import { GITHUB_TOKEN } from "$env/static/private";

export async function GET({ url }) {
  const owner = url.searchParams.get("owner");
  const repo = url.searchParams.get("repo");
  const branch = url.searchParams.get("branch");

  if (!owner || !repo || !branch) {
    return json({ error: "Missing required parameters" }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/commits/${branch}`,
      {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`GitHub API responded with ${response.status}`);
    }

    const data = await response.json();

    return json({
      sha: data.sha?.substring(0, 7) || "",
      commit_message: data.commit.message,
      author: data.commit.author.name,
      date: new Date(data.commit.author.date).toLocaleString(),
      url: `https://github.com/${owner}/${repo}/commit/${data.sha}`,
    });
  } catch (error) {
    console.error("Error fetching from GitHub:", error);
    return json({ error: (error as Error).message }, { status: 500 });
  }
}
