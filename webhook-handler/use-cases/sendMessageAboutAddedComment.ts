import {
    formatUserName,
    getTaskOrCommentTitle,
    reformatMarkdownToSlackMarkup,
    slackLink,
    slackQuote,
    slackSection,
    snapshotCommentAsSlackMetadata,
    iconEmoji
} from "../slack-helpers";
import { SendMessageArguments, SlackAPIAdapter } from "../SlackAPIAdapter";
import { PullRequestCommentActionNotification } from "../../typings";
import { findPullRequestChannel } from "../slack-helpers/findPullRequestChannel";

export async function sendMessageAboutAddedComment(payload: PullRequestCommentActionNotification, slackAPI: SlackAPIAdapter) {
    const channelInfo = await findPullRequestChannel(slackAPI, payload.pullRequest);
    await slackAPI.sendMessage(buildMessage(payload, channelInfo.id));
}

function buildMessage(payload: PullRequestCommentActionNotification, channelId: string): SendMessageArguments {
    const commentUrl = `${payload.pullRequest.links.self[0].href}?commentId=${payload.comment.id}`;
    const messageTitle = `${formatUserName(payload.actor)} ${slackLink(commentUrl, `added ${getTaskOrCommentTitle(payload)}`)}:`;
    const commentText = reformatMarkdownToSlackMarkup(payload.comment.text);

    return {
        channelId: channelId,
        iconEmoji: iconEmoji,
        text: messageTitle,
        blocks: [slackSection(messageTitle), slackSection(slackQuote(commentText))],
        metadata: snapshotCommentAsSlackMetadata(payload)
    };
}
