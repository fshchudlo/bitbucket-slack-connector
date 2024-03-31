import {
    buildChannelName,
    formatUserName,
    getMessageColor,
    reformatMarkdownToSlackMarkup
} from "../slack-building-blocks";
import { slackLink, slackQuote } from "../slack-building-blocks";
import { SlackGateway } from "../SlackGateway";
import { PullRequestCommentActionNotification } from "../../typings";

export async function sendMessageAboutAddedComment(payload: PullRequestCommentActionNotification, slackGateway: SlackGateway, iconEmoji: string) {
    const commentUrl = `${payload.pullRequest.links.self[0].href}?commentId=${payload.comment.id}`;
    const messageTitle = `${formatUserName(payload.actor)} ${slackLink(commentUrl, "commented")}:`;
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

