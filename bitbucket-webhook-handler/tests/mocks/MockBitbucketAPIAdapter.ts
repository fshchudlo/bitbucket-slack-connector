import { BitbucketAPIAdapter } from "../../ports/BitbucketAPIAdapter";

export class MockBitbucketAPIAdapter implements BitbucketAPIAdapter {
    canRead(): boolean {
        return true;
    }
    fetchCommitMessage(projectKey: string, repoSlug: string, commitHash: string): Promise<string> {
        return Promise.resolve(`Test comment for ${projectKey}, ${repoSlug}, ${commitHash}`);
    }
}