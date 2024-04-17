import {
    formatUserName,
    getTaskOrCommentTitle,
    reformatMarkdownToSlackMarkup,
    slackLink,
    slackQuote,
    slackSection,
    snapshotCommentToSlackMetadata,
    iconEmoji
} from "../slack-helpers";
import { BitbucketCommentSnapshot, SendMessageArguments, SlackAPIAdapter, SlackChannelInfo } from "../SlackAPIAdapter";
import { PullRequestCommentActionNotification } from "../../typings";

export async function sendMessageAboutAddedComment(payload: PullRequestCommentActionNotification, slackAPI: SlackAPIAdapter, channel: SlackChannelInfo) {
    const parentCommentSnapshot = payload.commentParentId ? await slackAPI.findLatestBitbucketCommentSnapshot(channel.id, payload.commentParentId) : null;
    await slackAPI.sendMessage(buildMessage(payload, parentCommentSnapshot, channel.id));
}

function buildMessage(payload: PullRequestCommentActionNotification, parentCommentSnapshot: BitbucketCommentSnapshot, channelId: string): SendMessageArguments {
    const commentUrl = `${payload.pullRequest.links.self[0].href}?commentId=${payload.comment.id}`;
    const action = parentCommentSnapshot ? "replied" : `added ${getTaskOrCommentTitle(payload)}`;
    const messageTitle = `${formatUserName(payload.actor)} ${slackLink(commentUrl, action)}:`;
    const commentText = reformatMarkdownToSlackMarkup(payload.comment.text);

    return {
        channelId: channelId,
        iconEmoji: iconEmoji,
        text: messageTitle,
        blocks: [slackSection(messageTitle), slackSection(slackQuote(commentText))],
        metadata: snapshotCommentToSlackMetadata(payload),
        threadId: parentCommentSnapshot?.slackThreadId || parentCommentSnapshot?.slackMessageId,
        replyBroadcast: parentCommentSnapshot ? true : undefined
    };
}
