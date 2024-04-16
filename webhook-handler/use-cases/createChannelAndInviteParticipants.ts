import {
    buildChannelName,
    formatUserName,
    getPullRequestDescriptionForSlack,
    slackLink,
    iconEmoji
} from "../slack-building-blocks";
import { SendMessageArguments, SlackAPIAdapter } from "../SlackAPIAdapter";
import { PullRequestBasicNotification } from "../../typings";

export async function createChannelAndInviteParticipants(payload: PullRequestBasicNotification, slackGateway: SlackAPIAdapter, createPrivateChannel: boolean) {
    const allParticipants = [payload.pullRequest.author.user].concat(payload.pullRequest.reviewers.map(r => r.user));
    const slackUserIds = await slackGateway.getSlackUserIds(allParticipants);

    const channelId = (
        await slackGateway.createChannel({
            name: buildChannelName(payload.pullRequest),
            isPrivate: createPrivateChannel
        })
    ).id;

    await slackGateway.setChannelTopic({ channelId, topic: buildChannelTopic(payload) });
    if (slackUserIds.length > 0) {
        await slackGateway.inviteToChannel({ channelId: channelId, users: slackUserIds, force: true });
    }
    await slackGateway.sendMessage(buildMessage(payload, channelId));
}

function buildMessage(payload: PullRequestBasicNotification, channelId: string): SendMessageArguments {
    const messageTitle = `The pull request was opened by ${formatUserName(payload.actor)}.`;
    const pleaseReviewText = `Please ${slackLink(payload.pullRequest.links.self[0].href, "review the PR")}`;
    const descriptionText = getPullRequestDescriptionForSlack(payload.pullRequest.description ?? payload.pullRequest.title);
    return {
        channel: channelId,
        iconEmoji: iconEmoji,
        text: messageTitle,
        attachments: [
            {
                text: descriptionText,
                color: "#0288D1"
            }, {
                text: pleaseReviewText
            }
        ]
    };
}

function buildChannelTopic({ pullRequest }: PullRequestBasicNotification) {
    const header = `${pullRequest.toRef.repository.project.key}/${pullRequest.toRef.repository.slug}:${pullRequest.toRef.displayId}`;
    let result = `:git: Pull request: ${slackLink(pullRequest.links.self[0].href, pullRequest.title)} | :git-branch: To branch: \`${header}\``;
    if (result.length > 250) {
        result = `:git: Pull request: ${pullRequest.title} | :git-branch: To branch: \`${header}\``;
    }
    return result;
}

