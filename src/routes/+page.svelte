<script lang="ts">
  type CommitInfo =
    | {
        sha: string;
        commit_message: string;
        author: string;
        date: string;
        url: string;
      }
    | {
        error: string;
      };

  type Commit = {
    owner: string;
    repo: string;
    branch: string;
    commitInfo: CommitInfo;
  };

  export let data: { commits: Commit[] };

  console.log(data)

  type BranchType = "prod" | "staging" | "dev";

  type GroupedCommits = {
    [key: string]: {
      owner: string;
      repo: string;
      branches: {
        branch: string;
        commitInfo: CommitInfo;
      }[];
    };
  };

  $: groupedCommits = data.commits.reduce<GroupedCommits>((acc, commit) => {
    const key = commit.owner + commit.repo;
    if (!acc[key]) {
      acc[key] = {
        owner: commit.owner,
        repo: commit.repo,
        branches: [],
      };
    }
    acc[key].branches.push({
      branch: commit.branch,
      commitInfo: commit.commitInfo,
    });

    // Sort branches
    acc[key].branches.sort((a, b) => {
      const branchOrder: Record<BranchType, number> = {
        prod: 0,
        staging: 1,
        dev: 2,
      };

      const getBranchOrder = (branch: string): number => {
        return branch in branchOrder ? branchOrder[branch as BranchType] : 999;
      };

      return getBranchOrder(a.branch) - getBranchOrder(b.branch);
    });

    return acc;
  }, {});

  // Format date to relative time
  function formatRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  }
</script>

<div class="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
  <div class="max-w-3xl mx-auto">
    <div class="bg-white rounded-lg shadow-lg overflow-hidden">
      <div class="bg-gray-800 px-6 py-4">
        <h1 class="text-xl font-semibold text-white">GitHub Branch Monitor</h1>
      </div>

      <div class="p-6">
        <div class="space-y-8">
          {#each Object.entries(groupedCommits) as [key, repo] (key)}
            <div class="border border-gray-200 rounded-lg overflow-hidden">
              <!-- Repository Header -->
              <div class="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <div class="flex items-center space-x-2">
                  <svg
                    class="h-5 w-5 text-gray-600"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"
                    />
                  </svg>
                  <span class="font-bold text-gray-900"
                    >{repo.owner} / {repo.repo}</span
                  >
                </div>
              </div>

              <!-- Branch Information -->
              <div class="divide-y divide-gray-200">
                {#each repo.branches as branch}
                  <div class="p-4 hover:bg-gray-50 transition duration-150">
                    <div class="flex items-center justify-between mb-3">
                      <span
                        class="px-3 py-1 text-sm font-medium {branch.branch ===
                        'prod'
                          ? 'bg-green-100 text-green-800'
                          : branch.branch === 'staging'
                            ? 'bg-yellow-100 text-yellow-800'
                            : branch.branch === 'dev'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'} rounded-full"
                      >
                        {branch.branch}
                      </span>

                      <!-- Time -->
                      {#if "date" in branch.commitInfo}
                        <span class="text-sm font-medium text-gray-500">
                          {formatRelativeTime(branch.commitInfo.date)}
                        </span>
                      {/if}
                    </div>

                    {#if "error" in branch.commitInfo}
                      <div
                        class="bg-red-50 border border-red-200 rounded-lg p-4"
                      >
                        <div class="flex items-center space-x-2">
                          <svg
                            class="h-5 w-5 text-red-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span class="text-red-600">
                            {branch.commitInfo.error}
                          </span>
                        </div>
                      </div>
                    {:else}
                      <a
                        href={branch.commitInfo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        class="block"
                      >
                        <div class="space-y-2">
                          <p class="text-gray-900 font-medium">
                            {branch.commitInfo.commit_message}
                          </p>

                          <div
                            class="flex flex-wrap items-center gap-4 text-sm text-gray-500"
                          >
                            <div class="flex items-center">
                              <svg
                                class="h-4 w-4 mr-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                  stroke-width="2"
                                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                />
                              </svg>
                              <span>{branch.commitInfo.author}</span>
                            </div>

                            <div class="flex items-center">
                              <svg
                                class="h-4 w-4 mr-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                  stroke-width="2"
                                  d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                                />
                              </svg>
                              <span class="font-mono text-xs">
                                {branch.commitInfo.sha}
                              </span>
                            </div>
                          </div>
                        </div>
                      </a>
                    {/if}
                  </div>
                {/each}
              </div>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>
</div>
