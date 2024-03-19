import buildChannelName from "../helper-functions/buildChannelName";
import { SlackGateway } from "../gateways/SlackGateway";
import { formatUserName } from "../slack-building-blocks/formatUserName";
import { PullRequestBasicNotification } from "../../typings";
import { getMessageColor } from "../slack-building-blocks/getMessageColor";

export async function sendCompletionMessageAndCloseTheChannel(
    payload: PullRequestBasicNotification,
    slackGateway: SlackGateway,
    iconEmoji: string
) {
    const pullRequest = payload.pullRequest;
    let message = null;
    switch (payload.eventKey) {
        case "pr:deleted":
            message = `The pull request was deleted by ${formatUserName(payload.actor)}.`;
            break;
        case "pr:merged":
            message = `The pull request was merged by ${formatUserName(payload.actor)}. Well done, thank you all.`;
            break;
        case "pr:declined":
            message = `The pull request was declined by ${formatUserName(payload.actor)}.`;
            break;
    }

    const messageResponse = await slackGateway.sendMessage({
        channel: buildChannelName(pullRequest),
        icon_emoji: iconEmoji,
        attachments: [
            {
                text: message,
                color: getMessageColor(payload)
            }]
    });

    await slackGateway.archiveChannel({
        //Close channel is quite unique and requires channel id, not the name. Take that id from sendMessage response to avoid extra triggers of Slack API
        channel: messageResponse.channel
    });
}
