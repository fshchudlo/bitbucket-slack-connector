import buildChannelName from "../buildChannelName";
import { PullRequestMergedDeclinedDeletedPayload, SlackGateway } from "../../contracts";

export async function sendCompletionMessageAndCloseTheChannel(
    payload: PullRequestMergedDeclinedDeletedPayload,
    slackGateway: SlackGateway
) {
    const pullRequest = payload.pullRequest;
    const channelName = buildChannelName(pullRequest.toRef.repository.project.key, pullRequest.toRef.repository.slug, pullRequest.id);
    let message = null;
    switch (payload.eventKey) {
        case "pr:deleted":
            message = `The pull request was deleted by ${payload.actor.name}.`;
            break;
        case "pr:merged":
            message = `The pull request was merged by ${payload.actor.name}. Well done, thank you all.`;
            break;
        case "pr:declined":
            message = `The pull request was declined by ${payload.actor.name}.`;
            break;
        default:
            throw new Error(`"${payload.eventKey}" payload is unknown.`);
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
