export interface BitbucketAPIAdapter {
    canRead(): boolean;
    fetchCommitMessage(projectKey: string, repoSlug: string, commitHash: string): Promise<string>;
}
