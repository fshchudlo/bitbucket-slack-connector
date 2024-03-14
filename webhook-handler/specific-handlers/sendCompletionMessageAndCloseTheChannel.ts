import buildChannelName from "../helper-functions/buildChannelName";
import { SlackGateway } from "../gateways/SlackGateway";
import { formatUserName } from "../slack-building-blocks/formatUserName";
import { PullRequestBasicNotification } from "../../typings";

export async function sendCompletionMessageAndCloseTheChannel(
    payload: PullRequestBasicNotification,
    slackGateway: SlackGateway
) {
    const pullRequest = payload.pullRequest;
    const channelName = buildChannelName(pullRequest.toRef.repository.project.key, pullRequest.toRef.repository.slug, pullRequest.id);
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
        channel: channelName,
        text: message
    });

    await slackGateway.archiveChannel({
        //Close channel is quite unique and requires channel id, not the name. Take that id from sendMessage response to avoid extra triggers of Slack API
        channel: messageResponse.channel
    });
}
