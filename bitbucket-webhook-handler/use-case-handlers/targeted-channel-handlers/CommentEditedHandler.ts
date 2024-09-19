import { PullRequestCommentActionNotification } from "../../../types/normalized-payload-types";
import { getTaskOrCommentTitle, snapshotCommentState } from "../utils";
import { link, quote, section } from "../utils/slack-building-blocks";
import { formatUserName, markdownToSlackMarkup } from "../utils";
import { WebhookPayloadHandler } from "../../WebhookPayloadHandler";
import { PullRequestCommentSnapshot, SendMessageArguments, SlackTargetedChannel } from "../../../types/slack-contracts";

export class CommentEditedHandler implements WebhookPayloadHandler {
    canHandle(payload: PullRequestCommentActionNotification) {
        return payload.eventKey == "pr:comment:edited";
    }

    async handle(payload: PullRequestCommentActionNotification, slackChannel: SlackTargetedChannel) {
        const commentSnapshot = await slackChannel.findLatestPullRequestCommentSnapshot(payload.comment.id);
        const message = buildSlackMessage(payload, commentSnapshot);
        await slackChannel.sendMessage(message);
    }
}

function buildSlackMessage(payload: PullRequestCommentActionNotification, commentSnapshot: PullRequestCommentSnapshot): SendMessageArguments {
    const userAction = getUserAction(payload, commentSnapshot);

    const messageTitle = `${userAction.emoji} ${formatUserName(payload.actor)} ${link(payload.comment.link, userAction.title)}:`;
    const commentText = markdownToSlackMarkup(payload.comment.text);

    return {
        text: messageTitle,
        blocks: [section(messageTitle), section(quote(commentText))],
        metadata: snapshotCommentState(payload),
        threadId: commentSnapshot?.slackThreadId || commentSnapshot?.slackMessageId,
        replyBroadcast: commentSnapshot ? true : undefined
    };
}

function getUserAction(payload: PullRequestCommentActionNotification, previousCommentSnapshot: PullRequestCommentSnapshot) {
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
        if (!previousCommentSnapshot.taskResolvedDate && payload.comment.resolvedAt) {
            return {
                title: `resolved ${commentType}`,
                emoji: ":white_check_mark:"
            };
        }
        if (previousCommentSnapshot.taskResolvedDate && !payload.comment.resolvedAt) {
            return {
                title: `reopened ${commentType}`,
                emoji: ":repeat:"
            };
        }
        if (!previousCommentSnapshot.threadResolvedDate && payload.comment.threadResolvedAt) {
            return {
                title: `resolved ${commentType}`,
                emoji: ":white_check_mark:"
            };
        }
        if (previousCommentSnapshot.threadResolvedDate && !payload.comment.threadResolvedAt) {
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