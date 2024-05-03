import { PullRequestCommentActionNotification } from "../../bitbucket-payload-types";
import {
    BitbucketCommentSnapshot,
    SlackChannel
} from "../SlackChannel";
import { getTaskOrCommentTitle, snapshotCommentState } from "./helpers";
import { iconEmoji, link, quote, section } from "./slack-building-blocks";
import { formatUserName, markdownToSlackMarkup } from "./helpers";

export async function sendMessageAboutEditedComment(payload: PullRequestCommentActionNotification, slackAPI: SlackChannel) {
    const commentUrl = `${payload.pullRequest.links.self[0].href}?commentId=${payload.comment.id}`;

    const commentSnapshot = await slackAPI.findLatestBitbucketCommentSnapshot(payload.comment.id);
    const userAction = await getUserAction(payload, commentSnapshot);

    const messageTitle = `${userAction.emoji} ${formatUserName(payload.actor)} ${link(commentUrl, userAction.title)}:`;
    const commentText = markdownToSlackMarkup(payload.comment.text);

    await slackAPI.sendMessage({
        iconEmoji: iconEmoji,
        text: messageTitle,
        blocks: [section(messageTitle), section(quote(commentText))],
        metadata: snapshotCommentState(payload),
        threadId: commentSnapshot?.slackThreadId || commentSnapshot?.slackMessageId,
        replyBroadcast: commentSnapshot ? true : undefined
    });
}

async function getUserAction(payload: PullRequestCommentActionNotification, previousCommentSnapshot: BitbucketCommentSnapshot): Promise<{
    title: string,
    emoji: string
}> {
    const commentType = getTaskOrCommentTitle(payload);
    if (previousCommentSnapshot) {
        if (previousCommentSnapshot.severity == "NORMAL" && payload.comment.severity == "BLOCKER") {
            return {
                title: "converted comment to the task",
                emoji: ":pushpin:"
            };
        }
        if (previousCommentSnapshot.severity == "BLOCKER" && payload.comment.severity == "NORMAL") {
            return {
                title: "converted task to the comment",
                emoji: ":writing_hand:"
            };
        }
        if (!previousCommentSnapshot.taskResolvedDate && payload.comment.resolvedDate) {
            return {
                title: `resolved ${commentType}`,
                emoji: ":white_check_mark:"
            };
        }
        if (previousCommentSnapshot.taskResolvedDate && !payload.comment.resolvedDate) {
            return {
                title: `reopened ${commentType}`,
                emoji: ":repeat:"
            };
        }
        if (!previousCommentSnapshot.threadResolvedDate && payload.comment.threadResolvedDate) {
            return {
                title: `resolved ${commentType}`,
                emoji: ":white_check_mark:"
            };
        }
        if (previousCommentSnapshot.threadResolvedDate && !payload.comment.threadResolvedDate) {
            return {
                title: `reopened ${commentType}`,
                emoji: ":repeat:"
            };
        }
    }
    return {
        title: `edited ${commentType}`,
        emoji: ":writing_hand:"
    };
}