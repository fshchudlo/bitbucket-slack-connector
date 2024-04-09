import {
    buildChannelName,
    formatUserName,
    getCommentType,
    reformatMarkdownToSlackMarkup,
    slackLink,
    slackQuote,
    slackSection,
    snapshotCommentAsSlackMetadata,
    iconEmoji
} from "../slack-building-blocks";
import { SlackGateway } from "../SlackGateway";
import { PullRequestCommentActionNotification } from "../../typings";

export async function sendMessageAboutAddedComment(payload: PullRequestCommentActionNotification, slackGateway: SlackGateway) {
    await slackGateway.sendMessage(buildMessage(payload));
}

function buildMessage(payload: PullRequestCommentActionNotification) {
    const commentUrl = `${payload.pullRequest.links.self[0].href}?commentId=${payload.comment.id}`;
    const messageTitle = `${formatUserName(payload.actor)} ${slackLink(commentUrl, `added ${getCommentType(payload)}`)}:`;
    const commentText = reformatMarkdownToSlackMarkup(payload.comment.text);

    return {
        channel: buildChannelName(payload.pullRequest),
        icon_emoji: iconEmoji,
        text: messageTitle,
        blocks: [slackSection(messageTitle), slackSection(slackQuote(commentText))],
        metadata: snapshotCommentAsSlackMetadata(payload)
    };
}
