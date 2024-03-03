import { PullRequestBasicPayload } from "../contracts";
import buildChannelName from "../helper-functions/buildChannelName";
import { slackLink } from "../slack-building-blocks";
import { SlackGateway } from "../slack-gateway/SlackGateway";

function buildChannelTopic({ pullRequest }: PullRequestBasicPayload) {
    const header = `${pullRequest.toRef.repository.project.key}/${pullRequest.toRef.repository.slug}:${pullRequest.toRef.displayId}`;
    let result = `:git: Pull request: *${slackLink(pullRequest.links.self[0].href, pullRequest.title)}* | :git-branch: To branch: *${header}*`;
    if (result.length > 250) {
        result = `:git: Pull request: *${pullRequest.title}* | :git-branch: To branch: *${header}*`;
    }
    return result;
}

export async function createChannelAndInviteParticipants(payload: PullRequestBasicPayload, slackGateway: SlackGateway) {
    const pullRequest = payload.pullRequest;
    const channelName = buildChannelName(pullRequest.toRef.repository.project.key, pullRequest.toRef.repository.slug, pullRequest.id);

    const slackUserRequests = [pullRequest.author.user.emailAddress].concat(pullRequest.reviewers.map(r => r.user.emailAddress)).map(
        async email =>
            await slackGateway.lookupUserByEmail({
                email: email
            })
    );

    const slackUserIds = [...new Set((await Promise.all(slackUserRequests)).map(r => r.user.id))];

    // Create a new Slack channel
    const channelId = (
        await slackGateway.createChannel({
            name: channelName,
            is_private: false
        })
    ).channel.id;

    await slackGateway.setChannelTopic({
        channel: channelId,
        topic: buildChannelTopic(payload)
    });

    await slackGateway.inviteToChannel({
        channel: channelId,
        users: slackUserIds.join(","),
        force: true
    });

    await slackGateway.sendMessage({
        channel: channelId,
        text: `The pull request was opened by ${pullRequest.author.user.displayName}. Please ${slackLink(pullRequest.links.self[0].href, "review the PR")}`
    });
}
