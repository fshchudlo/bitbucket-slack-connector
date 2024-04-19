import { BitbucketCommentSnapshot, SendMessageArguments, SlackAPIAdapter } from "../ports/SlackAPIAdapter";
import {
    formatUserName, getTaskOrCommentTitle,
    reformatMarkdownToSlackMarkup, quote, section, snapshotCommentToSlackMetadata, iconEmoji
} from "../slack-helpers";
import { PullRequestCommentActionNotification } from "../../typings";

export async function sendMessageAboutDeletedComment(payload: PullRequestCommentActionNotification, slackAPI: SlackAPIAdapter, slackChannelId: string) {
    const previousCommentSnapshot = await slackAPI.findLatestBitbucketCommentSnapshot(slackChannelId, payload.comment.id);
    await slackAPI.sendMessage(buildMessage(payload, previousCommentSnapshot, slackChannelId));
}

function buildMessage(payload: PullRequestCommentActionNotification, commentSnapshot: BitbucketCommentSnapshot, slackChannelId: string): SendMessageArguments {
    const messageTitle = `${formatUserName(payload.actor)} deleted ${getTaskOrCommentTitle(payload)}:`;
    const commentText = reformatMarkdownToSlackMarkup(payload.comment.text);
    return {
        channelId: slackChannelId,
        iconEmoji: iconEmoji,
        text: messageTitle,
        blocks: [section(messageTitle), section(quote(commentText))],
        metadata: snapshotCommentToSlackMetadata(payload),
        threadId: commentSnapshot?.slackThreadId || commentSnapshot?.slackMessageId,
        replyBroadcast: commentSnapshot ? true : undefined
    };
}
