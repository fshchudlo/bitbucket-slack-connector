import {
    formatUserName,
    getPullRequestDescriptionForSlack,
    slackLink,
    iconEmoji
} from "../slack-helpers";
import { SendMessageArguments, SlackAPIAdapter } from "../ports/SlackAPIAdapter";
import { PullRequestBasicNotification } from "../../typings";

export async function setChannelTopicAndInviteParticipants(payload: PullRequestBasicNotification, slackAPI: SlackAPIAdapter, slackChannelId: string) {
    const allParticipants = [payload.pullRequest.author.user].concat(payload.pullRequest.reviewers.map(r => r.user));
    const slackUserIds = await slackAPI.getSlackUserIds(allParticipants);

    await slackAPI.setChannelTopic({ channelId: slackChannelId, topic: buildChannelTopic(payload) });

    if (slackUserIds.length > 0) {
        await slackAPI.inviteToChannel({ channelId: slackChannelId, users: slackUserIds, force: true });
    }

    await slackAPI.sendMessage(buildMessage(payload, slackChannelId));
}

function buildMessage(payload: PullRequestBasicNotification, channelId: string): SendMessageArguments {
    const messageTitle = `The pull request was opened by ${formatUserName(payload.actor)}.`;
    const pleaseReviewText = `Please ${slackLink(payload.pullRequest.links.self[0].href, "review the PR")}`;
    const descriptionText = getPullRequestDescriptionForSlack(payload.pullRequest.description ?? payload.pullRequest.title);
    return {
        channelId: channelId,
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

