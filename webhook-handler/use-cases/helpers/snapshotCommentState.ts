import { PullRequestCommentActionNotification } from "../../../typings";
import { BitbucketCommentSnapshotInSlackMetadata } from "../../ports/SlackAPIAdapter";

export function snapshotCommentState(payload: PullRequestCommentActionNotification) {
    return {
        eventType: "bitbucket_comment_snapshot_saved",
        eventPayload: <BitbucketCommentSnapshotInSlackMetadata>{
            commentId: payload.comment.id.toString(),
            severity: payload.comment.severity,
            threadResolvedDate: payload.comment.threadResolvedDate,
            taskResolvedDate: payload.comment.resolvedDate,
            commentParentId: payload.commentParentId?.toString()
        }
    };
}
