import {
    PullRequestCommentAddedPayload
} from "../contracts";
import buildChannelName from "../helper-functions/buildChannelName";
import { slackLink, slackSection } from "../slack-building-blocks";
import { SlackGateway } from "../slack-gateway/SlackGateway";

export async function sendPRCommentToSlack(payload: PullRequestCommentAddedPayload, slackGateway: SlackGateway) {
    const pullRequest = payload.pullRequest;
    const channelName = buildChannelName(pullRequest.toRef.repository.project.key, pullRequest.toRef.repository.slug, pullRequest.id);
    const commentUrl = `${pullRequest.links.self[0].href}?commentId=${payload.comment.id}`;
    const slackMessageText = `*${payload.comment.author.displayName}* ${slackLink(commentUrl, "commented")}: ${payload.comment.text}`;

    await slackGateway.sendMessage({
        channel: channelName,
        text: slackMessageText,
        blocks: [
            slackSection(slackMessageText)
        ]
    });
}
