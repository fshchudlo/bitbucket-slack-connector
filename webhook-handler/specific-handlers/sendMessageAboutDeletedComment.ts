import { SlackGateway } from "../SlackGateway";
import {
    buildChannelName,
    formatUserName, getCommentType,
    reformatMarkdownToSlackMarkup, slackQuote, slackSection, snapshotCommentAsSlackMetadata
} from "../slack-building-blocks";
import { PullRequestCommentActionNotification } from "../../typings";

export async function sendMessageAboutDeletedComment(payload: PullRequestCommentActionNotification, slackGateway: SlackGateway, iconEmoji: string) {
    const messageTitle = `${formatUserName(payload.actor)} deleted ${getCommentType(payload)}:`;
    const commentText = reformatMarkdownToSlackMarkup(payload.comment.text);

    await slackGateway.sendMessage({
        channel: buildChannelName(payload.pullRequest),
        icon_emoji: iconEmoji,
        text: messageTitle,
        blocks: [slackSection(messageTitle), slackSection(slackQuote(commentText))],
        metadata: snapshotCommentAsSlackMetadata(payload)
    });
}