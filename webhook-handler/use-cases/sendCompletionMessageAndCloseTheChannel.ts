import { buildChannelName, formatUserName, iconEmoji } from "../slack-building-blocks";
import { SlackAPIAdapter } from "../SlackAPIAdapter";
import { PullRequestBasicNotification } from "../../typings";

export async function sendCompletionMessageAndCloseTheChannel(payload: PullRequestBasicNotification, slackGateway: SlackAPIAdapter) {
    const channelId = (await slackGateway.sendMessage(buildMessage(payload))).channel;
    await slackGateway.archiveChannel(channelId);
}

function buildMessage(payload: PullRequestBasicNotification) {
    const channelName = buildChannelName(payload.pullRequest);
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
        channel: channelName,
        icon_emoji: iconEmoji,
        text: messageText
    };
}
