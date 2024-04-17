import { formatUserName, iconEmoji } from "../slack-helpers";
import { SendMessageArguments, SlackAPIAdapter, SlackChannelInfo } from "../SlackAPIAdapter";
import { PullRequestBasicNotification } from "../../typings";

export async function sendCompletionMessageAndCloseTheChannel(payload: PullRequestBasicNotification, slackAPI: SlackAPIAdapter, channel: SlackChannelInfo) {
    await slackAPI.sendMessage(buildMessage(payload, channel.id));
    await slackAPI.archiveChannel(channel.id);
}

function buildMessage(payload: PullRequestBasicNotification, channelId: string): SendMessageArguments {
    let messageText = null;
    switch (payload.eventKey) {
        case "pr:deleted":
            messageText = `:no_entry_sign: The pull request was deleted by ${formatUserName(payload.actor)}.`;
            break;
        case "pr:merged":
            messageText = `:white_check_mark: The pull request was merged by ${formatUserName(payload.actor)}. Well done, thank you all.`;
            break;
        case "pr:declined":
            messageText = `:no_entry_sign: The pull request was declined by ${formatUserName(payload.actor)}.`;
            break;
    }
    return {
        channelId: channelId,
        iconEmoji: iconEmoji,
        text: messageText
    };
}
