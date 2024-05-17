import { formatUserName, getTaskOrCommentTitle, markdownToSlackMarkup, snapshotCommentState } from "../utils";
import { link, quote, section } from "../utils/slack-building-blocks";
import { BitbucketCommentSnapshot, SendMessageArguments, SlackChannel } from "../../SlackChannel";
import { PullRequestCommentActionNotification } from "../../../bitbucket-payload-types";
import { WebhookPayloadHandler } from "../../WebhookPayloadHandler";

export class CommentAddedHandler implements WebhookPayloadHandler {
    canHandle(payload: PullRequestCommentActionNotification) {
        return payload.eventKey == "pr:comment:added";
    }

    async handle(payload: PullRequestCommentActionNotification, slackChannel: SlackChannel) {
        const parentCommentSnapshot = payload.commentParentId ? await slackChannel.findLatestBitbucketCommentSnapshot(payload.commentParentId) : null;
        const message = buildSlackMessage(payload, parentCommentSnapshot);
        await slackChannel.sendMessage(message);
    }
}

function buildSlackMessage(payload: PullRequestCommentActionNotification, parentCommentSnapshot: BitbucketCommentSnapshot): SendMessageArguments {
    const commentUrl = `${payload.pullRequest.links.self[0].href}?commentId=${payload.comment.id}`;
    const action = parentCommentSnapshot ? "replied" : `added ${getTaskOrCommentTitle(payload)}`;
    const emoji = parentCommentSnapshot ? ":left_speech_bubble:" : `:loudspeaker:`;
    const messageTitle = `${emoji} ${formatUserName(payload.actor)} ${link(commentUrl, action)}:`;
    const commentText = markdownToSlackMarkup(payload.comment.text);

    return {
        text: messageTitle,
        blocks: [section(messageTitle), section(quote(commentText))],
        metadata: snapshotCommentState(payload),
        threadId: parentCommentSnapshot?.slackThreadId || parentCommentSnapshot?.slackMessageId,
        replyBroadcast: parentCommentSnapshot ? true : undefined
    };
}
