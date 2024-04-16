import { SendMessageArguments, SlackAPIAdapter } from "../SlackAPIAdapter";
import {
    buildChannelName,
    formatUserName, getTaskOrCommentTitle,
    reformatMarkdownToSlackMarkup, slackQuote, slackSection, snapshotCommentAsSlackMetadata, iconEmoji
} from "../slack-helpers";
import { PullRequestCommentActionNotification } from "../../typings";

export async function sendMessageAboutDeletedComment(payload: PullRequestCommentActionNotification, slackGateway: SlackAPIAdapter) {
    await slackGateway.sendMessage(buildMessage(payload));
}

function buildMessage(payload: PullRequestCommentActionNotification): SendMessageArguments {
    const messageTitle = `${formatUserName(payload.actor)} deleted ${getTaskOrCommentTitle(payload)}:`;
    const commentText = reformatMarkdownToSlackMarkup(payload.comment.text);
    return {
        channel: buildChannelName(payload.pullRequest),
        iconEmoji: iconEmoji,
        text: messageTitle,
        blocks: [slackSection(messageTitle), slackSection(slackQuote(commentText))],
        metadata: snapshotCommentAsSlackMetadata(payload)
    };
}
