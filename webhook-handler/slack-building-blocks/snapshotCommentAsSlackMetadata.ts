import { PullRequestCommentActionNotification } from "../../typings";
import { MessageMetadata } from "@slack/types/dist/message-metadata";
import { BitbucketCommentSnapshotInSlackMetadata } from "../SlackGateway";

export function snapshotCommentAsSlackMetadata(payload: PullRequestCommentActionNotification): MessageMetadata {
    return {
        event_type: "bitbucket_comment_snapshot_saved",
        event_payload: <BitbucketCommentSnapshotInSlackMetadata>{
            comment_id: payload.comment.id.toString(),
            severity: payload.comment.severity,
            thread_resolved: payload.comment.threadResolved
        }
    };
}