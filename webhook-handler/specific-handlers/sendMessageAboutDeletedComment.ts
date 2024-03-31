import { SlackGateway } from "../SlackGateway";
import {
    buildChannelName,
    formatUserName,
    getMessageColor,
    reformatMarkdownToSlackMarkup,
    slackQuote
} from "../slack-building-blocks";
import { PullRequestCommentActionNotification } from "../../typings";

export async function sendMessageAboutDeletedComment(payload: PullRequestCommentActionNotification, slackGateway: SlackGateway, iconEmoji: string) {
    const messageTitle = `${formatUserName(payload.actor)} deleted comment:`;
    const commentText = slackQuote(reformatMarkdownToSlackMarkup(payload.comment.text));

    await slackGateway.sendMessage({
        channel: buildChannelName(payload.pullRequest),
        icon_emoji: iconEmoji,
        attachments: [
            {
                title: messageTitle,
                text: commentText,
                color: getMessageColor(payload)
            }]
    });
}