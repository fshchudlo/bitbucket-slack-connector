import { PullRequestCommentActionNotification } from "../../contracts";

import { PullrequestCommentSnapshotInSlackMetadata } from "../../slack-api-ports";

export const SNAPSHOT_COMMENT_STATE_EVENT_TYPE = "bitbucket_comment_snapshot_saved";
export function snapshotCommentState(payload: PullRequestCommentActionNotification) {
    return {
        eventType: SNAPSHOT_COMMENT_STATE_EVENT_TYPE,
        eventPayload: <PullrequestCommentSnapshotInSlackMetadata>{
            commentId: payload.comment.id.toString(),
            severity: payload.comment.severity,
            threadResolvedDate: payload.comment.threadResolvedAt?.getTime(),
            taskResolvedDate: payload.comment.resolvedAt?.getTime(),
            commentParentId: payload.commentParentId?.toString()
        }
    };
}
