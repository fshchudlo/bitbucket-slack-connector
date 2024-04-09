import {
    buildChannelName,
    formatUserName,
    iconEmoji,
    reformatMarkdownToSlackMarkup,
    slackLink,
    slackQuote,
    slackSection
} from "../slack-building-blocks";
import { SlackGateway } from "../SlackGateway";
import { BitbucketGateway } from "../BitbucketGateway";
import { PullRequestBasicNotification } from "../../typings";

export async function sendMessageAboutNewCommit(payload: PullRequestBasicNotification, slackGateway: SlackGateway, bitbucketGateway: BitbucketGateway) {
    const commentInBitbucket = await bitbucketGateway.tryGetCommitMessage(payload.pullRequest.fromRef.repository.project.key, payload.pullRequest.fromRef.repository.slug, payload.pullRequest.fromRef.latestCommit);
    const message = buildMessage(payload, commentInBitbucket);
    await slackGateway.sendMessage(message);
}

function buildMessage(payload: PullRequestBasicNotification, commentInBitbucket: string) {
    const pullRequest = payload.pullRequest;
    const viewCommitUrl = `${payload.pullRequest.links.self[0].href.replace("/overview", "")}/commits/${pullRequest.fromRef.latestCommit}`;
    const messageTitle = `A ${slackLink(viewCommitUrl, "new commit")} was added to the pull request by ${formatUserName(payload.actor)}.`;
    const pleaseReviewText = `Please ${slackLink(payload.pullRequest.links.self[0].href, "review the PR")}.`;

    const commentText = slackQuote(reformatMarkdownToSlackMarkup(commentInBitbucket));
    return {
        channel: buildChannelName(pullRequest),
        icon_emoji: iconEmoji,
        text: messageTitle,
        blocks: [slackSection(messageTitle), slackSection(commentText), slackSection(pleaseReviewText)]
    };
}
