import { BitbucketGateway } from "../ports/BitbucketGateway";

export class TestBitbucketGateway implements BitbucketGateway {
    tryGetCommitMessage(projectKey: string, repoSlug: string, commitHash: string): Promise<string> {
        return Promise.resolve(`Test comment for ${projectKey}, ${repoSlug}, ${commitHash}`);
    }
}