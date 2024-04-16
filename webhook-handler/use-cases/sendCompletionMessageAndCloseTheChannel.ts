import { buildChannelName, formatUserName, iconEmoji } from "../slack-building-blocks";
import { SendMessageArguments, SlackAPIAdapter } from "../SlackAPIAdapter";
import { PullRequestBasicNotification } from "../../typings";

export async function sendCompletionMessageAndCloseTheChannel(payload: PullRequestBasicNotification, slackGateway: SlackAPIAdapter) {
    const channelId = (await slackGateway.sendMessage(buildMessage(payload))).channelId;
    await slackGateway.archiveChannel(channelId);
}

function buildMessage(payload: PullRequestBasicNotification): SendMessageArguments {
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
        iconEmoji: iconEmoji,
        text: messageText
    };
}
