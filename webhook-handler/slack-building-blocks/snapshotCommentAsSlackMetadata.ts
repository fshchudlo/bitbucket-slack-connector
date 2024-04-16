import { PullRequestCommentActionNotification } from "../../typings";
import { MessageMetadata } from "@slack/types/dist/message-metadata";
import { BitbucketCommentSnapshotInSlackMetadata } from "../SlackAPIAdapter";

export function snapshotCommentAsSlackMetadata(payload: PullRequestCommentActionNotification): MessageMetadata {
    return {
        event_type: "bitbucket_comment_snapshot_saved",
        event_payload: <BitbucketCommentSnapshotInSlackMetadata>{
            commentId: payload.comment.id.toString(),
            severity: payload.comment.severity,
            threadResolvedDate: payload.comment.threadResolvedDate,
            taskResolvedDate: payload.comment.resolvedDate,
            commentParentId: payload.commentParentId?.toString()
        }
    };
}