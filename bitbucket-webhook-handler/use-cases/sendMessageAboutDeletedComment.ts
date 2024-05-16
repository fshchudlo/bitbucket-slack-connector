import { BitbucketCommentSnapshot, SendMessageArguments, SlackChannel } from "../SlackChannel";
import { formatUserName, getTaskOrCommentTitle, markdownToSlackMarkup, snapshotCommentState } from "./helpers";
import { quote, section } from "./slack-building-blocks";
import { PullRequestCommentActionNotification } from "../../bitbucket-payload-types";

export async function sendMessageAboutDeletedComment(payload: PullRequestCommentActionNotification, slackChannel: SlackChannel) {
    const previousCommentSnapshot = await slackChannel.findLatestBitbucketCommentSnapshot(payload.comment.id);
    await slackChannel.sendMessage(buildMessage(payload, previousCommentSnapshot));
}

function buildMessage(payload: PullRequestCommentActionNotification, commentSnapshot: BitbucketCommentSnapshot): SendMessageArguments {
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
