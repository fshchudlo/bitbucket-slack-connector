import { PullRequestCommentActionNotification } from "../../typings";
import { SlackGateway } from "../gateways/SlackGateway";
import buildChannelName from "../helper-functions/buildChannelName";
import { formatUserName } from "../slack-building-blocks/formatUserName";
import { slackLink, slackQuote } from "../slack-building-blocks";
import reformatMarkdownToSlackMarkup from "../helper-functions/reformatMarkdownToSlackMarkup";
import { getMessageColor } from "../slack-building-blocks/getMessageColor";

export async function sendMessageAboutEditedCommentToSlack(payload: PullRequestCommentActionNotification, slackGateway: SlackGateway, iconEmoji: string) {
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