import { PullRequestCommentActionNotification } from "../../typings";

export function getCommentType(payload: PullRequestCommentActionNotification): "task" | "comment" {
    switch (payload.comment.severity) {
        case "BLOCKER":
            return "task";
        case "NORMAL":
            return "comment";
        default:
            throw new Error(`"${payload.comment.severity}" comment severity is unknown.`);
    }
}