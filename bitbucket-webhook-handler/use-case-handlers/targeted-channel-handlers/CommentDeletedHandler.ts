import { BitbucketCommentSnapshot, SendMessageArguments, SlackChannel } from "../../SlackChannel";
import { formatUserName, getTaskOrCommentTitle, markdownToSlackMarkup, snapshotCommentState } from "../utils";
import { quote, section } from "../utils/slack-building-blocks";
import { PullRequestCommentActionNotification } from "../../../bitbucket-payload-types";
import { WebhookPayloadHandler } from "../../WebhookPayloadHandler";

export class CommentDeletedHandler implements WebhookPayloadHandler {
    canHandle(payload: PullRequestCommentActionNotification) {
        return payload.eventKey == "pr:comment:deleted";
    }

    async handle(payload: PullRequestCommentActionNotification, slackChannel: SlackChannel) {
        const previousCommentSnapshot = await slackChannel.findLatestBitbucketCommentSnapshot(payload.comment.id);
        const message = buildSlackMessage(payload, previousCommentSnapshot);
        await slackChannel.sendMessage(message);
    }
}

function buildSlackMessage(payload: PullRequestCommentActionNotification, commentSnapshot: BitbucketCommentSnapshot): SendMessageArguments {
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
