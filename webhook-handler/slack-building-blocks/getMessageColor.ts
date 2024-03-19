import { BitbucketNotification } from "../../typings";

enum MessageColor {
    DEFAULT = "#0288D1",
    INFO = "#9E34EB",
    ACTION_REQUIRED = "#F6C342",
    SUCCESS = "#4CAF50"
}

export function getMessageColor(payload: BitbucketNotification) {
    const eventKey = payload.eventKey;
    switch (eventKey) {
        case "pr:opened":
        case "pr:comment:deleted":
        case "pr:reviewer:updated":
        case "pr:modified":
            return MessageColor.DEFAULT;
        case "pr:reviewer:unapproved":
        case "pr:reviewer:needs_work":
        case "pr:from_ref_updated":
        case "pr:comment:added":
            return MessageColor.ACTION_REQUIRED;
        case "pr:reviewer:approved":
        case "pr:merged":
            return MessageColor.SUCCESS;
        case "pr:declined":
        case "pr:deleted":
        case "pr:comment:edited":
            return MessageColor.INFO;
        default:
            throw new Error(`"${eventKey}" event key is unknown.`);
    }
}