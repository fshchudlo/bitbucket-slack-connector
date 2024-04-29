import { PullRequestBasicNotification } from "../../../typings";
import { formatUserName } from "./index";

export function getPullRequestCompletionAction(payload: PullRequestBasicNotification): {
    text: string,
    emoji: string,
    reaction: string
} {
    switch (payload.eventKey) {
        case "pr:deleted":
            return {
                text: `The pull request was deleted by ${formatUserName(payload.actor)}.`,
                emoji: ":no_entry_sign:",
                reaction: "no_entry_sign"
            };
        case "pr:declined":
            return {
                text: `The pull request was declined by ${formatUserName(payload.actor)}.`,
                emoji: ":no_entry_sign:",
                reaction: "no_entry_sign"
            };
        case "pr:merged":
            return {
                text: `The pull request was merged by ${formatUserName(payload.actor)}. Well done, thank you all.`,
                emoji: ":white_check_mark:",
                reaction: "white_check_mark"
            };
    }
}