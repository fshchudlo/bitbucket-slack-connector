import { SlackGateway } from "../SlackGateway";
import {
    buildChannelName,
    formatUserName, getTaskOrCommentTitle,
    reformatMarkdownToSlackMarkup, slackQuote, slackSection, snapshotCommentAsSlackMetadata, iconEmoji
} from "../slack-building-blocks";
import { PullRequestCommentActionNotification } from "../../typings";

export async function sendMessageAboutDeletedComment(payload: PullRequestCommentActionNotification, slackGateway: SlackGateway) {
    await slackGateway.sendMessage(buildMessage(payload));
}

function buildMessage(payload: PullRequestCommentActionNotification) {
    const messageTitle = `${formatUserName(payload.actor)} deleted ${getTaskOrCommentTitle(payload)}:`;
    const commentText = reformatMarkdownToSlackMarkup(payload.comment.text);
    return {
        channel: buildChannelName(payload.pullRequest),
        icon_emoji: iconEmoji,
        text: messageTitle,
        blocks: [slackSection(messageTitle), slackSection(slackQuote(commentText))],
        metadata: snapshotCommentAsSlackMetadata(payload)
    };
}
