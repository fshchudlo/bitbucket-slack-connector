import buildChannelName from "../helper-functions/buildChannelName";
import { slackLink, slackSection } from "../slack-building-blocks";
import { SlackGateway } from "../gateways/SlackGateway";
import getPullRequestDescriptionForSlack from "../helper-functions/getPullRequestDescriptionForSlack";
import { formatUserName } from "../slack-building-blocks/formatUserName";

function buildChannelTopic({ pullRequest }: PullRequestBasicNotification) {
    const header = `${pullRequest.toRef.repository.project.key}/${pullRequest.toRef.repository.slug}:${pullRequest.toRef.displayId}`;
    let result = `:git: Pull request: ${slackLink(pullRequest.links.self[0].href, pullRequest.title)} | :git-branch: To branch: \`${header}\``;
    if (result.length > 250) {
        result = `:git: Pull request: ${pullRequest.title} | :git-branch: To branch: \`${header}\``;
    }
    return result;
}

export async function createChannelAndInviteParticipants(payload: PullRequestBasicNotification, slackGateway: SlackGateway) {
    const pullRequest = payload.pullRequest;
    const channelName = buildChannelName(pullRequest.toRef.repository.project.key, pullRequest.toRef.repository.slug, pullRequest.id);
    const allParticipants = [pullRequest.author.user].concat(pullRequest.reviewers.map(r => r.user));
    const slackUserIds = await slackGateway.getSlackUserIds(allParticipants);

    const channelId = (
        await slackGateway.createChannel({
            name: channelName,
            is_private: true
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

    const messageTitle = `The pull request was opened by ${formatUserName(payload.actor)}.`;
    const pleaseReviewText = `Please ${slackLink(pullRequest.links.self[0].href, "review the PR")}`;
    const descriptionText = getPullRequestDescriptionForSlack(pullRequest.description ?? pullRequest.title);

    await slackGateway.sendMessage({
        channel: channelId,
        text: `${messageTitle} ${pleaseReviewText}`,
        blocks: [
            slackSection(messageTitle),
            slackSection(descriptionText),
            slackSection(pleaseReviewText)]
    });
}

