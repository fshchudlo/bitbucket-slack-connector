import { BitbucketCommentSnapshot, SendMessageArguments, SlackChannel } from "../SlackChannel";
import { formatUserName, getTaskOrCommentTitle, markdownToSlackMarkup, snapshotCommentState } from "./helpers";
import { quote, section, iconEmoji } from "./slack-building-blocks";
import { PullRequestCommentActionNotification } from "../../bitbucket-payload-types";

export async function sendMessageAboutDeletedComment(payload: PullRequestCommentActionNotification, slackAPI: SlackChannel) {
    const previousCommentSnapshot = await slackAPI.findLatestBitbucketCommentSnapshot(payload.comment.id);
    await slackAPI.sendMessage(buildMessage(payload, previousCommentSnapshot));
}

function buildMessage(payload: PullRequestCommentActionNotification, commentSnapshot: BitbucketCommentSnapshot): SendMessageArguments {
    const messageTitle = `:broom: ${formatUserName(payload.actor)} deleted ${getTaskOrCommentTitle(payload)}:`;
    const commentText = markdownToSlackMarkup(payload.comment.text);
    return {
        iconEmoji: iconEmoji,
        text: messageTitle,
        blocks: [section(messageTitle), section(quote(commentText))],
        metadata: snapshotCommentState(payload),
        threadId: commentSnapshot?.slackThreadId || commentSnapshot?.slackMessageId,
        replyBroadcast: commentSnapshot ? true : undefined
    };
}
