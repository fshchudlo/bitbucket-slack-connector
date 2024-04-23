import { BitbucketGateway } from "../../ports/BitbucketGateway";

export class TestBitbucketGateway implements BitbucketGateway {
    canRead(): boolean {
        return true;
    }
    fetchCommitMessage(projectKey: string, repoSlug: string, commitHash: string): Promise<string> {
        return Promise.resolve(`Test comment for ${projectKey}, ${repoSlug}, ${commitHash}`);
    }
}