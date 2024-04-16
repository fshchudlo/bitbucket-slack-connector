import { PullRequestCommentActionNotification } from "../../typings";
import { SlackAPIAdapter } from "../SlackAPIAdapter";
import {
    buildChannelName,
    formatUserName,
    getTaskOrCommentTitle,
    iconEmoji,
    reformatMarkdownToSlackMarkup,
    slackLink,
    slackQuote,
    slackSection,
    snapshotCommentAsSlackMetadata
} from "../slack-building-blocks";

export async function sendMessageAboutEditedComment(payload: PullRequestCommentActionNotification, slackGateway: SlackAPIAdapter) {
    const channelName = buildChannelName(payload.pullRequest);
    const commentUrl = `${payload.pullRequest.links.self[0].href}?commentId=${payload.comment.id}`;
    const userAction = await getUserAction(payload, slackGateway);

    const messageTitle = `${formatUserName(payload.actor)} ${slackLink(commentUrl, userAction)}:`;
    const commentText = reformatMarkdownToSlackMarkup(payload.comment.text);

    await slackGateway.sendMessage({
        channel: channelName,
        icon_emoji: iconEmoji,
        text: messageTitle,
        blocks: [slackSection(messageTitle), slackSection(slackQuote(commentText))],
        metadata: snapshotCommentAsSlackMetadata(payload)
    });
}

async function getUserAction(payload: PullRequestCommentActionNotification, slackGateway: SlackAPIAdapter) {
    const channelName = buildChannelName(payload.pullRequest);
    const commentType = getTaskOrCommentTitle(payload);
    const previousSnapshot = await slackGateway.findLatestBitbucketCommentSnapshot(channelName, payload.comment.id);
    if (previousSnapshot) {
        if (previousSnapshot.severity == "NORMAL" && payload.comment.severity == "BLOCKER") {
            return "converted comment to the task";
        }
        if (previousSnapshot.severity == "BLOCKER" && payload.comment.severity == "NORMAL") {
            return "converted task to the comment";
        }
        if (!previousSnapshot.taskResolvedDate && payload.comment.resolvedDate) {
            return `resolved ${commentType}`;
        }
        if (previousSnapshot.taskResolvedDate && !payload.comment.resolvedDate) {
            return `reopened ${commentType}`;
        }
        if (!previousSnapshot.threadResolvedDate && payload.comment.threadResolvedDate) {
            return `resolved ${commentType}`;
        }
        if (previousSnapshot.threadResolvedDate && !payload.comment.threadResolvedDate) {
            return `reopened ${commentType}`;
        }
        return `edited ${commentType}`;
    }
}