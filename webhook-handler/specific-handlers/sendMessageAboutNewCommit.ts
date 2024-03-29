import {
    buildChannelName,
    formatUserName,
    getMessageColor,
    reformatMarkdownToSlackMarkup,
    slackLink,
    slackQuote
} from "../slack-building-blocks";
import { SlackGateway } from "../ports/SlackGateway";
import { BitbucketGateway } from "../ports/BitbucketGateway";
import { PullRequestBasicNotification } from "../../typings";

export async function sendMessageAboutNewCommit(payload: PullRequestBasicNotification, slackGateway: SlackGateway, bitbucketGateway: BitbucketGateway, iconEmoji: string) {
    const pullRequest = payload.pullRequest;
    const viewCommitUrl = `${payload.pullRequest.links.self[0].href.replace("/overview", "")}/commits/${pullRequest.fromRef.latestCommit}`;
    const messageTitle = `A ${slackLink(viewCommitUrl, "new commit")} was added to the pull request by ${formatUserName(payload.actor)}.`;
    const pleaseReviewText = `Please ${slackLink(payload.pullRequest.links.self[0].href, "review the PR")}.`;

    const comment = await bitbucketGateway.tryGetCommitMessage(pullRequest.fromRef.repository.project.key, pullRequest.fromRef.repository.slug, pullRequest.fromRef.latestCommit);
    const commentText = slackQuote(reformatMarkdownToSlackMarkup(comment));

    await slackGateway.sendMessage({
        channel: buildChannelName(pullRequest),
        icon_emoji: iconEmoji,
        attachments: [
            {
                title: messageTitle,
                text: [commentText, pleaseReviewText].join("\n\n"),
                color: getMessageColor(payload)
            }]
    });
}
