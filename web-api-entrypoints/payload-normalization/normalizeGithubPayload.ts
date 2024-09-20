import { PullRequestNotification } from "../../use-cases/contracts";

export async function normalizeGithubPayload(payload: any): Promise<PullRequestNotification> {
    return Promise.resolve(payload);
}
