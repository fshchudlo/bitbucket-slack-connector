export interface BitbucketGateway {
    canRead(): boolean;
    fetchCommitMessage(projectKey: string, repoSlug: string, commitHash: string): Promise<string>;
}
