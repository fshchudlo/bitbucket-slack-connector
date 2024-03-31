import { PullRequestCommentActionNotification } from "../../typings";
import { SlackGateway } from "../SlackGateway";
import {
    buildChannelName,
    formatUserName,
    reformatMarkdownToSlackMarkup,
    slackLink, slackQuote, slackSection
} from "../slack-building-blocks";

export async function sendMessageAboutEditedComment(payload: PullRequestCommentActionNotification, slackGateway: SlackGateway, iconEmoji: string) {
    const commentUrl = `${payload.pullRequest.links.self[0].href}?commentId=${payload.comment.id}`;
    const messageTitle = `${formatUserName(payload.actor)} ${slackLink(commentUrl, "edited comment")}:`;
    const commentText = reformatMarkdownToSlackMarkup(payload.comment.text);

    await slackGateway.sendMessage({
        channel: buildChannelName(payload.pullRequest),
        icon_emoji: iconEmoji,
        text: messageTitle,
        blocks: [slackSection(messageTitle), slackSection(slackQuote(commentText))]
    });
}