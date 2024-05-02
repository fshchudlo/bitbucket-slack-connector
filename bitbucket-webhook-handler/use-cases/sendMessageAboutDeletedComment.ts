import { BitbucketCommentSnapshot, SendMessageArguments, SlackChannel } from "../SlackChannel";
import { formatUserName, getTaskOrCommentTitle, markdownToSlackMarkup, snapshotCommentState } from "./helpers";
import { quote, section, iconEmoji } from "./slack-building-blocks";
import { PullRequestCommentActionNotification } from "../../bitbucket-payload-types";

export async function sendMessageAboutDeletedComment(payload: PullRequestCommentActionNotification, slackAPI: SlackChannel, slackChannelId: string) {
    const previousCommentSnapshot = await slackAPI.findLatestBitbucketCommentSnapshot(slackChannelId, payload.comment.id);
    await slackAPI.sendMessage(buildMessage(payload, previousCommentSnapshot, slackChannelId));
}

function buildMessage(payload: PullRequestCommentActionNotification, commentSnapshot: BitbucketCommentSnapshot, slackChannelId: string): SendMessageArguments {
    const messageTitle = `:broom: ${formatUserName(payload.actor)} deleted ${getTaskOrCommentTitle(payload)}:`;
    const commentText = markdownToSlackMarkup(payload.comment.text);
    return {
        channelId: slackChannelId,
        iconEmoji: iconEmoji,
        text: messageTitle,
        blocks: [section(messageTitle), section(quote(commentText))],
        metadata: snapshotCommentState(payload),
        threadId: commentSnapshot?.slackThreadId || commentSnapshot?.slackMessageId,
        replyBroadcast: commentSnapshot ? true : undefined
    };
}
