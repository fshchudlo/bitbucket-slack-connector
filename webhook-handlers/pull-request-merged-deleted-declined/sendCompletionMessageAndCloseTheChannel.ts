import buildChannelName from "../buildChannelName";

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
            throw new Error("Unknown payload type.");
    }

    await slackGateway.sendMessage({
        channel: channelName,
        text: message,
    });

    await slackGateway.closeChannel({
        channel: channelName,
    });
}
