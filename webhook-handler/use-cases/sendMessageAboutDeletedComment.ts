import { SendMessageArguments, SlackAPIAdapter, SlackChannelInfo } from "../SlackAPIAdapter";
import {
    formatUserName, getTaskOrCommentTitle,
    reformatMarkdownToSlackMarkup, slackQuote, slackSection, snapshotCommentAsSlackMetadata, iconEmoji
} from "../slack-helpers";
import { PullRequestCommentActionNotification } from "../../typings";

export async function sendMessageAboutDeletedComment(payload: PullRequestCommentActionNotification, slackAPI: SlackAPIAdapter, channel: SlackChannelInfo) {
    await slackAPI.sendMessage(buildMessage(payload, channel.id));
}

function buildMessage(payload: PullRequestCommentActionNotification, channelId: string): SendMessageArguments {
    const messageTitle = `${formatUserName(payload.actor)} deleted ${getTaskOrCommentTitle(payload)}:`;
    const commentText = reformatMarkdownToSlackMarkup(payload.comment.text);
    return {
        channelId: channelId,
        iconEmoji: iconEmoji,
        text: messageTitle,
        blocks: [slackSection(messageTitle), slackSection(slackQuote(commentText))],
        metadata: snapshotCommentAsSlackMetadata(payload)
    };
}
