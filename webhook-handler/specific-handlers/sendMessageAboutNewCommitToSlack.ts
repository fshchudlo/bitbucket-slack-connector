import buildChannelName from "../helper-functions/buildChannelName";
import { slackLink, slackQuote } from "../slack-building-blocks";
import { SlackGateway } from "../gateways/SlackGateway";
import { BitbucketGateway } from "../gateways/BitbucketGateway";
import reformatMarkdownToSlackMarkup from "../helper-functions/reformatMarkdownToSlackMarkup";
import { formatUserName } from "../slack-building-blocks/formatUserName";
import { PullRequestBasicNotification } from "../../typings";
import { getMessageColor } from "../slack-building-blocks/getMessageColor";

export async function sendMessageAboutNewCommitToSlack(payload: PullRequestBasicNotification, slackGateway: SlackGateway, bitbucketGateway: BitbucketGateway, iconEmoji: string) {
    const pullRequest = payload.pullRequest;
    const viewCommitUrl = `${payload.pullRequest.links.self[0].href.replace("/overview", "")}/commits/${pullRequest.fromRef.latestCommit}`;
    const messageTitle = `A ${slackLink(viewCommitUrl, "new commit")} was added to the pull request by ${formatUserName(payload.actor)}.`;
    const pleaseReviewText = `Please ${slackLink(payload.pullRequest.links.self[0].href, "review the PR")}.`;

    const commentText = await bitbucketGateway.tryGetCommitMessage(pullRequest.fromRef.repository.project.key, pullRequest.fromRef.repository.slug, pullRequest.fromRef.latestCommit);

    await slackGateway.sendMessage({
        channel: buildChannelName(pullRequest),
        icon_emoji: iconEmoji,
        attachments: [
            {
                title: messageTitle,
                text: [slackQuote(reformatMarkdownToSlackMarkup(commentText)), pleaseReviewText].join("\n\n"),
                color: getMessageColor(payload)
            }]
    });
}
