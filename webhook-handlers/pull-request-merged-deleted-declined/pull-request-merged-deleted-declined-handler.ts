import buildChannelName from "../buildChannelName";

export async function handlePullRequestCreated(payload: PullRequestCreatedPayload, slackClient: SlackGateway) {
    const pullRequest = payload.pullRequest;
    const channelName = buildChannelName(pullRequest.toRef.repository.project.key, pullRequest.toRef.repository.slug, pullRequest.id);

    await slackClient.closeChannel({
        channel: channelName,
    });
}
