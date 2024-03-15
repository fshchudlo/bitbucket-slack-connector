import { SlackGateway } from "../gateways/SlackGateway";
import buildChannelName from "../helper-functions/buildChannelName";
import { slackQuote } from "../slack-building-blocks";
import reformatMarkdownToSlackMarkup from "../helper-functions/reformatMarkdownToSlackMarkup";
import { formatUserName } from "../slack-building-blocks/formatUserName";
import { PullRequestCommentAddedOrDeletedNotification } from "../../typings";
import { getMessageColor } from "../slack-building-blocks/getMessageColor";

export async function sendMessageAboutDeletedCommentToSlack(payload: PullRequestCommentAddedOrDeletedNotification, slackGateway: SlackGateway, iconEmoji: string) {
    const pullRequest = payload.pullRequest;
    const channelName = buildChannelName(pullRequest);
    const messageTitle = `${formatUserName(payload.actor)} deleted comment:`;
    await slackGateway.sendMessage({
        channel: channelName,
        icon_emoji: iconEmoji,
        attachments: [
            {
                title: messageTitle,
                text: slackQuote(reformatMarkdownToSlackMarkup(payload.comment.text)),
                color: getMessageColor(payload)
            }]
    });

}