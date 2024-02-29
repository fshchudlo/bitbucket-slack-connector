import buildChannelName from "../buildChannelName";

function buildChannelTopic({ pullRequest }: PullRequestCreatedPayload) {
    const header = `${pullRequest.toRef.repository.project.key}/${pullRequest.toRef.repository.slug}:${pullRequest.toRef.displayId}`;
    let result = `:git: Pull request: *<${pullRequest.links.self[0]}|${pullRequest.title}>* | :git-branch: To branch: *${header}*`;
    if (result.length > 250) {
        result = `:git: Pull request: *${pullRequest.title}* | :git-branch: To branch: *${header}*`;
    }
    return result;
}

export async function handlePullRequestCreated(payload: PullRequestCreatedPayload, slackGateway: SlackGateway) {
    const pullRequest = payload.pullRequest;
    const channelName = buildChannelName(pullRequest.toRef.repository.project.key, pullRequest.toRef.repository.slug, pullRequest.id);

    const slackUserRequests = [pullRequest.author.user.emailAddress].concat(pullRequest.reviewers.map(r => r.user.emailAddress)).map(
        async email =>
            await slackGateway.lookupUserByEmail({
                email: email
            })
    );

    const slackUserIds = (await Promise.all(slackUserRequests)).map(r => r.user.id);

    // Create a new Slack channel
    const channelId = (
        await slackGateway.createChannel({
            name: channelName,
            is_private: false,
        })
    ).channel.id;

    await slackGateway.setChannelTopic({
        channel: channelId,
        topic: buildChannelTopic(payload),
    });

    await slackGateway.inviteToChannel({
        channel: channelId,
        users: slackUserIds.join(","),
        force: true,
    });

    return channelId;
}
