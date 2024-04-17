export interface BitbucketGateway {
    tryGetCommitMessage(projectKey: string, repoSlug: string, commitHash: string): Promise<string>;
}
