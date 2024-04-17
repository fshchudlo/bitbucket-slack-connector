import { PullRequestCommentActionNotification } from "../../typings";
import {
    BitbucketCommentSnapshot,
    SlackAPIAdapter
} from "../ports/SlackAPIAdapter";
import {
    formatUserName,
    getTaskOrCommentTitle,
    iconEmoji,
    reformatMarkdownToSlackMarkup,
    slackLink,
    slackQuote,
    slackSection,
    snapshotCommentToSlackMetadata
} from "../slack-helpers";

export async function sendMessageAboutEditedComment(payload: PullRequestCommentActionNotification, slackAPI: SlackAPIAdapter, slackChannelId: string) {
    const commentUrl = `${payload.pullRequest.links.self[0].href}?commentId=${payload.comment.id}`;

    const commentSnapshot = await slackAPI.findLatestBitbucketCommentSnapshot(slackChannelId, payload.comment.id);
    const userAction = await getUserAction(payload, commentSnapshot);

    const messageTitle = `${formatUserName(payload.actor)} ${slackLink(commentUrl, userAction)}:`;
    const commentText = reformatMarkdownToSlackMarkup(payload.comment.text);

    await slackAPI.sendMessage({
        channelId: slackChannelId,
        iconEmoji: iconEmoji,
        text: messageTitle,
        blocks: [slackSection(messageTitle), slackSection(slackQuote(commentText))],
        metadata: snapshotCommentToSlackMetadata(payload),
        threadId: commentSnapshot?.slackThreadId || commentSnapshot?.slackMessageId,
        replyBroadcast: commentSnapshot ? true : undefined
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