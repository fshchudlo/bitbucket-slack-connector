import { PullRequestCommentAddedPayload } from "../contracts";
import buildChannelName from "../helper-functions/buildChannelName";
import { slackLink, slackQuote, slackSection } from "../slack-building-blocks";
import { SlackGateway } from "../gateways/SlackGateway";
import reformatMarkdownToSlackMarkup from "../helper-functions/reformatMarkdownToSlackMarkup";

export async function sendPRCommentToSlack(payload: PullRequestCommentAddedPayload, slackGateway: SlackGateway) {
    const pullRequest = payload.pullRequest;
    const channelName = buildChannelName(pullRequest.toRef.repository.project.key, pullRequest.toRef.repository.slug, pullRequest.id);
    const commentUrl = `${pullRequest.links.self[0].href}?commentId=${payload.comment.id}`;
    const messageTitle = `*${payload.comment.author.displayName}* ${slackLink(commentUrl, "commented")}:`;
    await slackGateway.sendMessage({
        channel: channelName,
        text: `${messageTitle}\n\n${payload.comment.text}`,
        blocks: [
            slackSection(messageTitle),
            slackSection(slackQuote(reformatMarkdownToSlackMarkup(payload.comment.text)))
        ]
    });
}

