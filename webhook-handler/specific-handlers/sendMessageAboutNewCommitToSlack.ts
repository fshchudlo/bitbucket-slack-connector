import {
    PullRequestNotificationBasicPayload
} from "../contracts";
import buildChannelName from "../helper-functions/buildChannelName";
import { slackLink, slackQuote, slackSection } from "../slack-building-blocks";
import { SlackGateway } from "../gateways/SlackGateway";
import { BitbucketGateway } from "../gateways/BitbucketGateway";
import reformatMarkdownToSlackMarkup from "../helper-functions/reformatMarkdownToSlackMarkup";

export async function sendMessageAboutNewCommitToSlack(payload: PullRequestNotificationBasicPayload, slackGateway: SlackGateway, bitbucketGateway: BitbucketGateway) {
    const pullRequest = payload.pullRequest;
    const channelName = buildChannelName(pullRequest.toRef.repository.project.key, pullRequest.toRef.repository.slug, pullRequest.id);

    const viewCommitUrl = `${payload.pullRequest.links.self[0].href.replace("/overview", "")}/commits/${pullRequest.fromRef.latestCommit}`;
    const messageTitle = `A ${slackLink(viewCommitUrl, "new commit")} was added to the pull request by ${payload.actor.displayName}.`;
    const pleaseReviewText = `Please ${slackLink(payload.pullRequest.links.self[0].href, "review the PR")}.`;

    const commentText = await bitbucketGateway.tryGetCommitMessage(pullRequest.fromRef.repository.project.key, pullRequest.fromRef.repository.slug, pullRequest.fromRef.latestCommit);

    await slackGateway.sendMessage({
        channel: channelName,
        text: `${messageTitle} ${pleaseReviewText}`,
        blocks: [
            slackSection(messageTitle),
            commentText ? slackSection(slackQuote(reformatMarkdownToSlackMarkup(commentText))) : null,
            slackSection(pleaseReviewText)
        ].filter(b => b !== null)
    });
}
