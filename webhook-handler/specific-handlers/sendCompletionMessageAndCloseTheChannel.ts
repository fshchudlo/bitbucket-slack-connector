import { buildChannelName, formatUserName } from "../slack-building-blocks";
import { SlackGateway } from "../SlackGateway";
import { PullRequestBasicNotification } from "../../typings";

export async function sendCompletionMessageAndCloseTheChannel(payload: PullRequestBasicNotification, slackGateway: SlackGateway, iconEmoji: string) {
    let message = null;
    switch (payload.eventKey) {
        case "pr:deleted":
            message = `:no_entry_sign: The pull request was deleted by ${formatUserName(payload.actor)}.`;
            break;
        case "pr:merged":
            message = `:white_check_mark: The pull request was merged by ${formatUserName(payload.actor)}. Well done, thank you all.`;
            break;
        case "pr:declined":
            message = `:no_entry_sign: The pull request was declined by ${formatUserName(payload.actor)}.`;
            break;
    }

    const messageResponse = await slackGateway.sendMessage({
        channel: buildChannelName(payload.pullRequest),
        icon_emoji: iconEmoji,
        text: message
    });

    await slackGateway.archiveChannel(messageResponse.channel);
}
