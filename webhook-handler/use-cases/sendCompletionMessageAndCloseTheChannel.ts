import { formatUserName, iconEmoji } from "../slack-helpers";
import { SendMessageArguments, SlackAPIAdapter } from "../ports/SlackAPIAdapter";
import { PullRequestBasicNotification } from "../../typings";

export async function sendCompletionMessageAndCloseTheChannel(payload: PullRequestBasicNotification, slackAPI: SlackAPIAdapter, slackChannelId: string) {
    await slackAPI.sendMessage(buildMessage(payload, slackChannelId));
    await slackAPI.archiveChannel(slackChannelId);
}

function buildMessage(payload: PullRequestBasicNotification, channelId: string): SendMessageArguments {
    let messageText = null;
    switch (payload.eventKey) {
        case "pr:deleted":
            messageText = `:no_entry_sign: The pull request was deleted by ${formatUserName(payload.actor)}.`;
            break;
        case "pr:declined":
            messageText = `:no_entry_sign: The pull request was declined by ${formatUserName(payload.actor)}.`;
            break;
        case "pr:merged":
            messageText = `:white_check_mark: The pull request was merged by ${formatUserName(payload.actor)}. Well done, thank you all.`;
            break;
    }
    return {
        channelId: channelId,
        iconEmoji: iconEmoji,
        text: messageText
    };
}
