import {
    buildChannelName,
    formatUserName,
    reformatMarkdownToSlackMarkup, slackQuote, slackSection
} from "../slack-building-blocks";
import { slackLink } from "../slack-building-blocks";
import { SlackGateway } from "../SlackGateway";
import { PullRequestCommentActionNotification } from "../../typings";

export async function sendMessageAboutAddedComment(payload: PullRequestCommentActionNotification, slackGateway: SlackGateway, iconEmoji: string) {
    const commentUrl = `${payload.pullRequest.links.self[0].href}?commentId=${payload.comment.id}`;
    const messageTitle = `${formatUserName(payload.actor)} ${slackLink(commentUrl, "added comment")}:`;
    const commentText = reformatMarkdownToSlackMarkup(payload.comment.text);

    await slackGateway.sendMessage({
        channel: buildChannelName(payload.pullRequest),
        icon_emoji: iconEmoji,
        text: messageTitle,
        blocks: [slackSection(messageTitle), slackSection(slackQuote(commentText))]
    });
}

