import { PullRequestBasicNotification } from "../../../bitbucket-payload-types";
import { formatUserName } from "./index";

export function getPullRequestCompletionAction(payload: PullRequestBasicNotification): {
    text: string,
    emoji: string,
    reaction: string
} {
    switch (payload.eventKey) {
        case "pr:deleted":
            return {
                text: `Pull request was deleted by ${formatUserName(payload.actor)}.`,
                emoji: ":no_entry_sign:",
                reaction: "no_entry_sign"
            };
        case "pr:declined":
            return {
                text: `Pull request was declined by ${formatUserName(payload.actor)}.`,
                emoji: ":no_entry_sign:",
                reaction: "no_entry_sign"
            };
        case "pr:merged":
            return {
                text: `Pull request was merged by ${formatUserName(payload.actor)}. Well done, thank you all.`,
                emoji: ":white_check_mark:",
                reaction: "white_check_mark"
            };
    }
}