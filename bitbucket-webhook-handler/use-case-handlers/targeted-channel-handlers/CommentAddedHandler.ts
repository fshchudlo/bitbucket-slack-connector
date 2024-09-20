import { formatUserName, getTaskOrCommentTitle, markdownToSlackMarkup, snapshotCommentState } from "../utils";
import { link, quote, section } from "../utils/slack-building-blocks";
import { PullRequestCommentActionNotification } from "../../../types/normalized-payload-types";
import { WebhookPayloadHandler } from "../WebhookPayloadHandler";
import { PullRequestCommentSnapshot, SendMessageArguments, SlackTargetedChannel } from "../../slack-api-ports";

export class CommentAddedHandler implements WebhookPayloadHandler {
    canHandle(payload: PullRequestCommentActionNotification) {
        return payload.eventKey == "pr:comment:added";
    }

    async handle(payload: PullRequestCommentActionNotification, slackChannel: SlackTargetedChannel) {
        const parentCommentSnapshot = payload.commentParentId ? await slackChannel.findLatestPullRequestCommentSnapshot(payload.commentParentId) : null;
        const message = buildSlackMessage(payload, parentCommentSnapshot);
        await slackChannel.sendMessage(message);
    }
}

function buildSlackMessage(payload: PullRequestCommentActionNotification, parentCommentSnapshot: PullRequestCommentSnapshot): SendMessageArguments {
    const action = parentCommentSnapshot ? "replied" : `added ${getTaskOrCommentTitle(payload)}`;
    const emoji = parentCommentSnapshot ? ":left_speech_bubble:" : `:loudspeaker:`;
    const messageTitle = `${emoji} ${formatUserName(payload.actor)} ${link(payload.comment.link, action)}:`;
    const commentText = markdownToSlackMarkup(payload.comment.text);

    return {
        text: messageTitle,
        blocks: [section(messageTitle), section(quote(commentText))],
        metadata: snapshotCommentState(payload),
        threadId: parentCommentSnapshot?.slackThreadId || parentCommentSnapshot?.slackMessageId,
        replyBroadcast: parentCommentSnapshot ? true : undefined
    };
}
