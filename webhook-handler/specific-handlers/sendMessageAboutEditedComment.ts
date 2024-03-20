import { PullRequestCommentActionNotification } from "../../typings";
import { SlackGateway } from "../ports/SlackGateway";
import {
    buildChannelName,
    formatUserName,
    getMessageColor,
    reformatMarkdownToSlackMarkup,
    slackLink,
    slackQuote
} from "../slack-building-blocks";

export async function sendMessageAboutEditedComment(payload: PullRequestCommentActionNotification, slackGateway: SlackGateway, iconEmoji: string) {
    const commentUrl = `${payload.pullRequest.links.self[0].href}?commentId=${payload.comment.id}`;
    const messageTitle = `${formatUserName(payload.actor)} ${slackLink(commentUrl, "edited comment")}:`;

    await slackGateway.sendMessage({
        channel: buildChannelName(payload.pullRequest),
        icon_emoji: iconEmoji,
        attachments: [
            {
                title: messageTitle,
                text: slackQuote(reformatMarkdownToSlackMarkup(payload.comment.text)),
                color: getMessageColor(payload)
            }]
    });
}