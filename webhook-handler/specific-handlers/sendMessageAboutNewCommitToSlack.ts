import {
    PullRequestBasicPayload
} from "../contracts";
import buildChannelName from "../helper-functions/buildChannelName";
import { slackLink, slackSection } from "../slack-building-blocks";
import { SlackGateway } from "../gateways/SlackGateway";
import { BitbucketGateway } from "../gateways/BitbucketGateway";

export async function sendMessageAboutNewCommitToSlack(payload: PullRequestBasicPayload, slackGateway: SlackGateway, bitbucketGateway: BitbucketGateway) {
    const pullRequest = payload.pullRequest;
    const channelName = buildChannelName(pullRequest.toRef.repository.project.key, pullRequest.toRef.repository.slug, pullRequest.id);

    const viewCommitUrl = `${payload.pullRequest.links.self[0].href.replace("/overview", "")}/commits/${pullRequest.fromRef.latestCommit}`;
    const messageTitle = `A ${slackLink(viewCommitUrl, "new commit")} was added to the pull request by ${payload.actor.displayName}.`;
    const pleaseReviewText = `Please ${slackLink(payload.pullRequest.links.self[0].href, "review the PR")}.`;

    const commentText = await bitbucketGateway.tryGetCommitMessage(pullRequest.fromRef.repository.project.key, pullRequest.fromRef.repository.slug, pullRequest.fromRef.latestCommit);

    const messageBlocks = [slackSection(messageTitle), commentText ? slackSection(`> ${commentText}`) : null, slackSection(pleaseReviewText)];
    await slackGateway.sendMessage({
        channel: channelName,
        text: `${messageTitle} ${pleaseReviewText}`,
        blocks: messageBlocks.filter(b => b !== null)
    });
}
