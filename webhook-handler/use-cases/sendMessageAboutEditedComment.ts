import { PullRequestCommentActionNotification } from "../../typings";
import {
    BitbucketCommentSnapshot,
    SlackAPIAdapter
} from "../SlackAPIAdapter";
import {
    formatUserName,
    getTaskOrCommentTitle,
    iconEmoji,
    reformatMarkdownToSlackMarkup,
    slackLink,
    slackQuote,
    slackSection,
    snapshotCommentAsSlackMetadata
} from "../slack-helpers";
import { findPullRequestChannel } from "../slack-helpers/findPullRequestChannel";

export async function sendMessageAboutEditedComment(payload: PullRequestCommentActionNotification, slackAPI: SlackAPIAdapter) {
    const channelInfo = await findPullRequestChannel(slackAPI, payload.pullRequest);
    const commentUrl = `${payload.pullRequest.links.self[0].href}?commentId=${payload.comment.id}`;

    const previousCommentSnapshot = await slackAPI.findLatestBitbucketCommentSnapshot(channelInfo.id, payload.comment.id);
    const userAction = await getUserAction(payload, previousCommentSnapshot);

    const messageTitle = `${formatUserName(payload.actor)} ${slackLink(commentUrl, userAction)}:`;
    const commentText = reformatMarkdownToSlackMarkup(payload.comment.text);

    await slackAPI.sendMessage({
        channelId: channelInfo.id,
        iconEmoji: iconEmoji,
        text: messageTitle,
        blocks: [slackSection(messageTitle), slackSection(slackQuote(commentText))],
        metadata: snapshotCommentAsSlackMetadata(payload)
    });
}

async function getUserAction(payload: PullRequestCommentActionNotification, previousCommentSnapshot: BitbucketCommentSnapshot) {
    const commentType = getTaskOrCommentTitle(payload);
    if (previousCommentSnapshot) {
        if (previousCommentSnapshot.severity == "NORMAL" && payload.comment.severity == "BLOCKER") {
            return "converted comment to the task";
        }
        if (previousCommentSnapshot.severity == "BLOCKER" && payload.comment.severity == "NORMAL") {
            return "converted task to the comment";
        }
        if (!previousCommentSnapshot.taskResolvedDate && payload.comment.resolvedDate) {
            return `resolved ${commentType}`;
        }
        if (previousCommentSnapshot.taskResolvedDate && !payload.comment.resolvedDate) {
            return `reopened ${commentType}`;
        }
        if (!previousCommentSnapshot.threadResolvedDate && payload.comment.threadResolvedDate) {
            return `resolved ${commentType}`;
        }
        if (previousCommentSnapshot.threadResolvedDate && !payload.comment.threadResolvedDate) {
            return `reopened ${commentType}`;
        }
        return `edited ${commentType}`;
    }
}