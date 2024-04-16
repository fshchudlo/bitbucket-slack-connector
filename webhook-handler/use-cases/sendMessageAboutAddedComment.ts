import {
    buildChannelName,
    formatUserName,
    getTaskOrCommentTitle,
    reformatMarkdownToSlackMarkup,
    slackLink,
    slackQuote,
    slackSection,
    snapshotCommentAsSlackMetadata,
    iconEmoji
} from "../slack-building-blocks";
import { SendMessageArguments, SlackAPIAdapter } from "../SlackAPIAdapter";
import { PullRequestCommentActionNotification } from "../../typings";

export async function sendMessageAboutAddedComment(payload: PullRequestCommentActionNotification, slackGateway: SlackAPIAdapter) {
    await slackGateway.sendMessage(buildMessage(payload));
}

function buildMessage(payload: PullRequestCommentActionNotification): SendMessageArguments {
    const commentUrl = `${payload.pullRequest.links.self[0].href}?commentId=${payload.comment.id}`;
    const messageTitle = `${formatUserName(payload.actor)} ${slackLink(commentUrl, `added ${getTaskOrCommentTitle(payload)}`)}:`;
    const commentText = reformatMarkdownToSlackMarkup(payload.comment.text);

    return {
        channel: buildChannelName(payload.pullRequest),
        iconEmoji: iconEmoji,
        text: messageTitle,
        blocks: [slackSection(messageTitle), slackSection(slackQuote(commentText))],
        metadata: snapshotCommentAsSlackMetadata(payload)
    };
}
