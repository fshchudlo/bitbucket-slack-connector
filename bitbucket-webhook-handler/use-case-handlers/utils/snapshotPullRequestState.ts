import { PullRequestBasicNotification } from "../../../bitbucket-payload-types";
import { PullRequestSnapshotInSlackMetadata } from "../../slack-contracts/SlackBroadcastChannel";

export const SNAPSHOT_PULL_REQUEST_STATE_EVENT_TYPE = "bitbucket_pull_request_opened";
export function snapshotPullRequestState(payload: PullRequestBasicNotification) {
    return {
        eventType: SNAPSHOT_PULL_REQUEST_STATE_EVENT_TYPE,
        eventPayload: <PullRequestSnapshotInSlackMetadata>{
            pullRequestId: payload.pullRequest.id.toString(),
            projectKey: payload.pullRequest.toRef.repository.project.key,
            repositorySlug: payload.pullRequest.toRef.repository.slug
        }
    };
}