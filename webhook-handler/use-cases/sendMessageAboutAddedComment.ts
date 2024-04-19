import {
    formatUserName,
    getTaskOrCommentTitle,
    reformatMarkdownToSlackMarkup,
    link,
    quote,
    section,
    snapshotCommentToSlackMetadata,
    iconEmoji
} from "../slack-helpers";
import { BitbucketCommentSnapshot, SendMessageArguments, SlackAPIAdapter } from "../ports/SlackAPIAdapter";
import { PullRequestCommentActionNotification } from "../../typings";

export async function sendMessageAboutAddedComment(payload: PullRequestCommentActionNotification, slackAPI: SlackAPIAdapter, slackChannelId: string) {
    const parentCommentSnapshot = payload.commentParentId ? await slackAPI.findLatestBitbucketCommentSnapshot(slackChannelId, payload.commentParentId) : null;
    await slackAPI.sendMessage(buildMessage(payload, parentCommentSnapshot, slackChannelId));
}

function buildMessage(payload: PullRequestCommentActionNotification, parentCommentSnapshot: BitbucketCommentSnapshot, channelId: string): SendMessageArguments {
    const commentUrl = `${payload.pullRequest.links.self[0].href}?commentId=${payload.comment.id}`;
    const action = parentCommentSnapshot ? "replied" : `added ${getTaskOrCommentTitle(payload)}`;
    const messageTitle = `${formatUserName(payload.actor)} ${link(commentUrl, action)}:`;
    const commentText = reformatMarkdownToSlackMarkup(payload.comment.text);

    return {
        channelId: channelId,
        iconEmoji: iconEmoji,
        text: messageTitle,
        blocks: [section(messageTitle), section(quote(commentText))],
        metadata: snapshotCommentToSlackMetadata(payload),
        threadId: parentCommentSnapshot?.slackThreadId || parentCommentSnapshot?.slackMessageId,
        replyBroadcast: parentCommentSnapshot ? true : undefined
    };
}
