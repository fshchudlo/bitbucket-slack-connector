import { PullRequestCommentAddedOrDeletedPayload } from "../contracts";
import { SlackGateway } from "../gateways/SlackGateway";
import buildChannelName from "../helper-functions/buildChannelName";
import { slackBold, slackQuote, slackSection } from "../slack-building-blocks";
import reformatMarkdownToSlackMarkup from "../helper-functions/reformatMarkdownToSlackMarkup";

export async function sendMessageAboutDeletedCommentToSlack(payload: PullRequestCommentAddedOrDeletedPayload, slackGateway: SlackGateway) {
    const pullRequest = payload.pullRequest;
    const channelName = buildChannelName(pullRequest.toRef.repository.project.key, pullRequest.toRef.repository.slug, pullRequest.id);
    const messageTitle = `${slackBold(payload.actor.displayName)} deleted comment:`;
    await slackGateway.sendMessage({
        channel: channelName,
        text: `${messageTitle}\n\n${slackQuote(payload.comment.text)}`,
        blocks: [
            slackSection(messageTitle),
            slackSection(slackQuote(reformatMarkdownToSlackMarkup(payload.comment.text)))
        ]
    });
}