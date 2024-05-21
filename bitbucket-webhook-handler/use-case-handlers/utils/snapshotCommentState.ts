import { PullRequestCommentActionNotification } from "../../../bitbucket-payload-types";
import { BitbucketCommentSnapshotInSlackMetadata } from "../../slack-contracts/SlackTargetedChannel";

export const SNAPSHOT_COMMENT_STATE_EVENT_TYPE = "bitbucket_comment_snapshot_saved";
export function snapshotCommentState(payload: PullRequestCommentActionNotification) {
    return {
        eventType: SNAPSHOT_COMMENT_STATE_EVENT_TYPE,
        eventPayload: <BitbucketCommentSnapshotInSlackMetadata>{
            commentId: payload.comment.id.toString(),
            severity: payload.comment.severity,
            threadResolvedDate: payload.comment.threadResolvedDate,
            taskResolvedDate: payload.comment.resolvedDate,
            commentParentId: payload.commentParentId?.toString()
        }
    };
}
