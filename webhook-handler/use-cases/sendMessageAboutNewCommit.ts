import {
    formatUserName,
    iconEmoji,
    reformatMarkdownToSlackMarkup,
    link,
    quote,
    section
} from "../slack-helpers";
import { SendMessageArguments, SlackAPIAdapter } from "../ports/SlackAPIAdapter";
import { BitbucketGateway } from "../ports/BitbucketGateway";
import { PullRequestBasicNotification } from "../../typings";

export async function sendMessageAboutNewCommit(payload: PullRequestBasicNotification, slackAPI: SlackAPIAdapter, bitbucketGateway: BitbucketGateway, slackChannelId: string) {
    const commentInBitbucket = await bitbucketGateway.tryGetCommitMessage(payload.pullRequest.fromRef.repository.project.key, payload.pullRequest.fromRef.repository.slug, payload.pullRequest.fromRef.latestCommit);
    const message = buildMessage(payload, commentInBitbucket, slackChannelId);
    await slackAPI.sendMessage(message);
}

function buildMessage(payload: PullRequestBasicNotification, commentInBitbucket: string, slackChannelId: string): SendMessageArguments {
    const pullRequest = payload.pullRequest;
    const viewCommitUrl = `${pullRequest.links.self[0].href.replace("/overview", "")}/commits/${pullRequest.fromRef.latestCommit}`;
    const messageTitle = `A ${link(viewCommitUrl, "new commit")} was added to the pull request by ${formatUserName(payload.actor)}.`;
    const pleaseReviewText = `Please ${link(pullRequest.links.self[0].href, "review the PR")}.`;

    const commentText = quote(reformatMarkdownToSlackMarkup(commentInBitbucket));
    return {
        channelId: slackChannelId,
        iconEmoji: iconEmoji,
        text: messageTitle,
        blocks: [section(messageTitle), section(commentText), section(pleaseReviewText)]
    };
}
