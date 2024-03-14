import buildChannelName from "../helper-functions/buildChannelName";
import { slackLink, slackQuote, slackSection } from "../slack-building-blocks";
import { SlackGateway } from "../gateways/SlackGateway";
import reformatMarkdownToSlackMarkup from "../helper-functions/reformatMarkdownToSlackMarkup";
import { formatUserName } from "../slack-building-blocks/formatUserName";
import { PullRequestCommentAddedOrDeletedNotification } from "../../typings";

export async function sendMessageAboutAddedCommentToSlack(payload: PullRequestCommentAddedOrDeletedNotification, slackGateway: SlackGateway) {
    const pullRequest = payload.pullRequest;
    const channelName = buildChannelName(pullRequest.toRef.repository.project.key, pullRequest.toRef.repository.slug, pullRequest.id);
    const commentUrl = `${pullRequest.links.self[0].href}?commentId=${payload.comment.id}`;
    const messageTitle = `${formatUserName(payload.actor)} ${slackLink(commentUrl, "commented")}:`;
    await slackGateway.sendMessage({
        channel: channelName,
        text: `${messageTitle}\n\n${slackQuote(payload.comment.text)}`,
        blocks: [
            slackSection(messageTitle),
            slackSection(slackQuote(reformatMarkdownToSlackMarkup(payload.comment.text)))
        ]
    });
}

