import { formatUserName, getTaskOrCommentTitle, markdownToSlackMarkup, snapshotCommentState } from "./helpers";
import { link, quote, section } from "./slack-building-blocks";
import { BitbucketCommentSnapshot, SendMessageArguments, SlackChannel } from "../SlackChannel";
import { PullRequestCommentActionNotification } from "../../bitbucket-payload-types";

export async function sendMessageAboutAddedComment(payload: PullRequestCommentActionNotification, slackChannel: SlackChannel) {
    const parentCommentSnapshot = payload.commentParentId ? await slackChannel.findLatestBitbucketCommentSnapshot(payload.commentParentId) : null;
    await slackChannel.sendMessage(buildMessage(payload, parentCommentSnapshot));
}

function buildMessage(payload: PullRequestCommentActionNotification, parentCommentSnapshot: BitbucketCommentSnapshot): SendMessageArguments {
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
