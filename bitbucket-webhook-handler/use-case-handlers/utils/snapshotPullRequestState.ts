import { PullRequestGenericNotification } from "../../../types/normalized-payload-types";

import { PullRequestSnapshotInSlackMetadata } from "../../slack-api-ports";

export const SNAPSHOT_PULL_REQUEST_STATE_EVENT_TYPE = "pull_request_opened";
export function snapshotPullRequestState(payload: PullRequestGenericNotification) {
    return {
        eventType: SNAPSHOT_PULL_REQUEST_STATE_EVENT_TYPE,
        eventPayload: <PullRequestSnapshotInSlackMetadata>{
            pullRequestId: payload.pullRequest.number.toString(),
            projectKey: payload.pullRequest.targetBranch.projectKey,
            repositorySlug: payload.pullRequest.targetBranch.repositoryName
        }
    };
}