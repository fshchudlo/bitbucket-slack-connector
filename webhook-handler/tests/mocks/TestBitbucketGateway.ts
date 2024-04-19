import { BitbucketGateway } from "../../ports/BitbucketGateway";
import { PullRequestPayload } from "../../../typings";
import TestPayloadBuilder from "./TestPayloadBuilder";

export class TestBitbucketGateway implements BitbucketGateway {
    tryGetCommitMessage(projectKey: string, repoSlug: string, commitHash: string): Promise<string> {
        return Promise.resolve(`Test comment for ${projectKey}, ${repoSlug}, ${commitHash}`);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getPullRequest(_projectKey: string, _repoSlug: string, _commitHash: string): Promise<PullRequestPayload> {
        return Promise.resolve(TestPayloadBuilder.pullRequestOpened().pullRequest);
    }
}