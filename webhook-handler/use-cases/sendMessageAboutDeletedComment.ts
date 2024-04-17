import { BitbucketCommentSnapshot, SendMessageArguments, SlackAPIAdapter, SlackChannelInfo } from "../SlackAPIAdapter";
import {
    formatUserName, getTaskOrCommentTitle,
    reformatMarkdownToSlackMarkup, slackQuote, slackSection, snapshotCommentAsSlackMetadata, iconEmoji
} from "../slack-helpers";
import { PullRequestCommentActionNotification } from "../../typings";

export async function sendMessageAboutDeletedComment(payload: PullRequestCommentActionNotification, slackAPI: SlackAPIAdapter, channel: SlackChannelInfo) {
    const previousCommentSnapshot = await slackAPI.findLatestBitbucketCommentSnapshot(channel.id, payload.comment.id);
    await slackAPI.sendMessage(buildMessage(payload, previousCommentSnapshot, channel.id));
}

function buildMessage(payload: PullRequestCommentActionNotification, commentSnapshot: BitbucketCommentSnapshot, channelId: string): SendMessageArguments {
    const messageTitle = `${formatUserName(payload.actor)} deleted ${getTaskOrCommentTitle(payload)}:`;
    const commentText = reformatMarkdownToSlackMarkup(payload.comment.text);
    return {
        channelId: channelId,
        iconEmoji: iconEmoji,
        text: messageTitle,
        blocks: [slackSection(messageTitle), slackSection(slackQuote(commentText))],
        metadata: snapshotCommentAsSlackMetadata(payload),
        threadId: commentSnapshot?.slackThreadId || commentSnapshot?.slackMessageId,
        replyBroadcast: commentSnapshot ? true : undefined
    };
}
