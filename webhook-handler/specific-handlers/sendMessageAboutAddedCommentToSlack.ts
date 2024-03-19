import buildChannelName from "../helper-functions/buildChannelName";
import { slackLink, slackQuote } from "../slack-building-blocks";
import { SlackGateway } from "../gateways/SlackGateway";
import reformatMarkdownToSlackMarkup from "../helper-functions/reformatMarkdownToSlackMarkup";
import { formatUserName } from "../slack-building-blocks/formatUserName";
import { PullRequestCommentActionNotification } from "../../typings";
import { getMessageColor } from "../slack-building-blocks/getMessageColor";

export async function sendMessageAboutAddedCommentToSlack(payload: PullRequestCommentActionNotification, slackGateway: SlackGateway, iconEmoji: string) {
    const pullRequest = payload.pullRequest;
    const commentUrl = `${pullRequest.links.self[0].href}?commentId=${payload.comment.id}`;
    const messageTitle = `${formatUserName(payload.actor)} ${slackLink(commentUrl, "commented")}:`;
    await slackGateway.sendMessage({
        channel: buildChannelName(pullRequest),
        icon_emoji: iconEmoji,
        attachments: [
            {
                title: messageTitle,
                text: slackQuote(reformatMarkdownToSlackMarkup(payload.comment.text)),
                color: getMessageColor(payload)
            }]
    });
}

