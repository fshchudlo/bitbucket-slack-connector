import { PullRequestNotification } from "../types/normalized-payload-types";

export async function normalizeGithubPayload(payload: any): Promise<PullRequestNotification> {
    return Promise.resolve(payload);
}
