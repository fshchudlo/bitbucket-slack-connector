import { PullRequestPayload } from "../../typings";

export interface BitbucketGateway {
    tryGetCommitMessage(projectKey: string, repoSlug: string, commitHash: string): Promise<string>;

    getPullRequest(projectKey: string, repoSlug: string, pullRequestId: string): Promise<PullRequestPayload>;
}
