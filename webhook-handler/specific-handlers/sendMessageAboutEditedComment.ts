import { PullRequestCommentActionNotification } from "../../typings";
import { SlackGateway } from "../SlackGateway";
import {
    buildChannelName,
    formatUserName, getCommentType,
    reformatMarkdownToSlackMarkup,
    slackLink, slackQuote, slackSection, snapshotCommentAsSlackMetadata
} from "../slack-building-blocks";

export async function sendMessageAboutEditedComment(payload: PullRequestCommentActionNotification, slackGateway: SlackGateway, iconEmoji: string) {
    const commentUrl = `${payload.pullRequest.links.self[0].href}?commentId=${payload.comment.id}`;
    const messageTitle = `${formatUserName(payload.actor)} ${slackLink(commentUrl, `edited ${getCommentType(payload)}`)}:`;
    const commentText = reformatMarkdownToSlackMarkup(payload.comment.text);

    await slackGateway.sendMessage({
        channel: buildChannelName(payload.pullRequest),
        icon_emoji: iconEmoji,
        text: messageTitle,
        blocks: [slackSection(messageTitle), slackSection(slackQuote(commentText))],
        metadata: snapshotCommentAsSlackMetadata(payload)
    });
}