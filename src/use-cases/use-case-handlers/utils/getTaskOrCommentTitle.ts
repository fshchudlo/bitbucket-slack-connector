import { PullRequestCommentActionNotification } from "../../contracts";

export function getTaskOrCommentTitle(payload: PullRequestCommentActionNotification): "task" | "comment" {
    switch (payload.comment.severity) {
        case "BLOCKER":
            return "task";
        case "NORMAL":
            return "comment";
        default:
            throw new Error(`"${payload.comment.severity}" comment severity is unknown.`);
    }
}