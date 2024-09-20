
import { formatUserName, getTaskOrCommentTitle, markdownToSlackMarkup, snapshotCommentState } from "../utils";
import { quote, section } from "../utils/slack-building-blocks";
import { PullRequestCommentActionNotification } from "../../../types/normalized-payload-types";
import { WebhookPayloadHandler } from "../WebhookPayloadHandler";
import { PullRequestCommentSnapshot, SendMessageArguments, SlackTargetedChannel } from "../../slack-api-ports";

export class CommentDeletedHandler implements WebhookPayloadHandler {
    canHandle(payload: PullRequestCommentActionNotification) {
        return payload.eventKey == "pr:comment:deleted";
    }

    async handle(payload: PullRequestCommentActionNotification, slackChannel: SlackTargetedChannel) {
        const previousCommentSnapshot = await slackChannel.findLatestPullRequestCommentSnapshot(payload.comment.id);
        const message = buildSlackMessage(payload, previousCommentSnapshot);
        await slackChannel.sendMessage(message);
    }
}

function buildSlackMessage(payload: PullRequestCommentActionNotification, commentSnapshot: PullRequestCommentSnapshot): SendMessageArguments {
    const messageTitle = `:broom: ${formatUserName(payload.actor)} deleted ${getTaskOrCommentTitle(payload)}:`;
    const commentText = markdownToSlackMarkup(payload.comment.text);
    return {
        text: messageTitle,
        blocks: [section(messageTitle), section(quote(commentText))],
        metadata: snapshotCommentState(payload),
        threadId: commentSnapshot?.slackThreadId || commentSnapshot?.slackMessageId,
        replyBroadcast: commentSnapshot ? true : undefined
    };
}
