import { BitbucketNotification, PullRequestFromRefUpdatedPayload } from "../bitbucket-payload-types";
import BitbucketAPI from "./BitbucketAPI";

export async function normalizeBitbucketWebhookPayload(payload: BitbucketNotification, bitbucketAPI: BitbucketAPI) {
    const eventKey = payload.eventKey;

    switch (eventKey) {
        case "pr:opened":
        case "pr:modified":
        case "pr:reviewer:updated":
        case "pr:reviewer:unapproved":
        case "pr:reviewer:needs_work":
        case "pr:reviewer:approved":
        case "pr:comment:added":
        case "pr:comment:edited":
        case "pr:comment:deleted":
        case "pr:merged":
        case "pr:declined":
        case "pr:deleted":
            return payload;
        case "pr:from_ref_updated":
            return <PullRequestFromRefUpdatedPayload>{
                ...payload,
                latestCommitMessage: bitbucketAPI.canRead() ? await bitbucketAPI.fetchCommitMessage(payload.pullRequest.fromRef.repository.project.key, payload.pullRequest.fromRef.repository.slug, payload.pullRequest.fromRef.latestCommit) : null
            };
        default:
            throw new Error(`"${eventKey}" event key is unknown.`);
    }
}
