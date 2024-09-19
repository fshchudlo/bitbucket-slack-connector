import { PullRequestGenericNotification } from "../../../types/normalized-payload-types";
import { formatUserName } from "./formatUserName";

export function getPullRequestCompletionAction(payload: PullRequestGenericNotification): {
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