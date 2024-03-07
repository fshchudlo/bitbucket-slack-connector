import { PullRequestNotificationBasicPayload } from "../contracts";
import buildChannelName from "../helper-functions/buildChannelName";
import { slackLink, slackSection } from "../slack-building-blocks";
import { SlackGateway } from "../gateways/SlackGateway";
import reformatMarkdownToSlackMarkup from "../helper-functions/reformatMarkdownToSlackMarkup";
import getSlackUserIds from "../helper-functions/getSlackUserIds";

function buildChannelTopic({ pullRequest }: PullRequestNotificationBasicPayload) {
    const header = `${pullRequest.toRef.repository.project.key}/${pullRequest.toRef.repository.slug}:${pullRequest.toRef.displayId}`;
    let result = `:git: Pull request: *${slackLink(pullRequest.links.self[0].href, pullRequest.title)}* | :git-branch: To branch: *${header}*`;
    if (result.length > 250) {
        result = `:git: Pull request: *${pullRequest.title}* | :git-branch: To branch: *${header}*`;
    }
    return result;
}

export async function createChannelAndInviteParticipants(payload: PullRequestNotificationBasicPayload, slackGateway: SlackGateway) {
    const pullRequest = payload.pullRequest;
    const channelName = buildChannelName(pullRequest.toRef.repository.project.key, pullRequest.toRef.repository.slug, pullRequest.id);
    const allParticipants = [pullRequest.author.user].concat(pullRequest.reviewers.map(r => r.user));
    const slackUserIds = await getSlackUserIds(allParticipants, slackGateway);

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

    const messageTitle = `The pull request was opened by ${pullRequest.author.user.displayName}.`;
    const pleaseReviewText = `Please ${slackLink(pullRequest.links.self[0].href, "review the PR")}`;
    await slackGateway.sendMessage({
        channel: channelId,
        text: `${messageTitle} ${pleaseReviewText}`,
        blocks: [
            slackSection(messageTitle),
            slackSection(reformatMarkdownToSlackMarkup(pullRequest.description?.substring(0, 3000) ?? pullRequest.title)),
            slackSection(pleaseReviewText)]
    });
}
