import { BitbucketNotification, PullRequestFromRefUpdatedPayload } from "../bitbucket-payload-types";
import BitbucketAPI from "./BitbucketAPI";

export async function normalizeBitbucketWebhookPayload(payload: BitbucketNotification, bitbucketAPI: BitbucketAPI) {
    if (payload.eventKey == "pr:from_ref_updated") {
        return <PullRequestFromRefUpdatedPayload>{
            ...payload,
            latestCommitMessage: bitbucketAPI.canRead() ? await bitbucketAPI.fetchCommitMessage(payload.pullRequest.fromRef.repository.project.key, payload.pullRequest.fromRef.repository.slug, payload.pullRequest.fromRef.latestCommit) : null
        };
    }
    return Promise.resolve(payload);
}
