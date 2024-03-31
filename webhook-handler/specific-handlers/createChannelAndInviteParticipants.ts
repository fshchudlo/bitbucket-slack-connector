import {
    buildChannelName,
    formatUserName,
    getMessageColor,
    getPullRequestDescriptionForSlack,
    slackLink
} from "../slack-building-blocks";
import { SlackGateway } from "../SlackGateway";
import { PullRequestBasicNotification } from "../../typings";

export async function createChannelAndInviteParticipants(payload: PullRequestBasicNotification, slackGateway: SlackGateway, iconEmoji: string, createPrivateChannel: boolean) {
    const allParticipants = [payload.pullRequest.author.user].concat(payload.pullRequest.reviewers.map(r => r.user));
    const slackUserIds = await slackGateway.getSlackUserIds(allParticipants);

    const channelId = (
        await slackGateway.createChannel({
            name: buildChannelName(payload.pullRequest),
            is_private: createPrivateChannel
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
    const pleaseReviewText = `Please ${slackLink(payload.pullRequest.links.self[0].href, "review the PR")}`;
    const descriptionText = getPullRequestDescriptionForSlack(payload.pullRequest.description ?? payload.pullRequest.title);

    await slackGateway.sendMessage({
        channel: channelId,
        icon_emoji: iconEmoji,
        attachments: [
            {
                title: messageTitle,
                text: descriptionText,
                color: getMessageColor(payload)
            }, {
                text: pleaseReviewText,
                color: getMessageColor(payload)
            }
        ]
    });
}

function buildChannelTopic({ pullRequest }: PullRequestBasicNotification) {
    const header = `${pullRequest.toRef.repository.project.key}/${pullRequest.toRef.repository.slug}:${pullRequest.toRef.displayId}`;
    let result = `:git: Pull request: ${slackLink(pullRequest.links.self[0].href, pullRequest.title)} | :git-branch: To branch: \`${header}\``;
    if (result.length > 250) {
        result = `:git: Pull request: ${pullRequest.title} | :git-branch: To branch: \`${header}\``;
    }
    return result;
}

