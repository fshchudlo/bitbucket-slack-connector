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
    const commentInBitbucket = bitbucketGateway.canRead() ? await bitbucketGateway.fetchCommitMessage(payload.pullRequest.fromRef.repository.project.key, payload.pullRequest.fromRef.repository.slug, payload.pullRequest.fromRef.latestCommit) : null;
    const message = buildMessage(payload, commentInBitbucket, slackChannelId);
    await slackAPI.sendMessage(message);
}

function buildMessage(payload: PullRequestBasicNotification, commentInBitbucket: string | null, slackChannelId: string): SendMessageArguments {
    const pullRequest = payload.pullRequest;
    const viewCommitUrl = `${pullRequest.links.self[0].href.replace("/overview", "")}/commits/${pullRequest.fromRef.latestCommit}`;
    const messageTitle = `${formatUserName(payload.actor)} added ${link(viewCommitUrl, "new commit")}.`;
    const pleaseReviewText = `Please ${link(pullRequest.links.self[0].href, "review the PR")}.`;

    const commentSection = commentInBitbucket ? section(`Commit message: \n\n${quote(reformatMarkdownToSlackMarkup(commentInBitbucket))}`) : null;
    return {
        channelId: slackChannelId,
        iconEmoji: iconEmoji,
        text: messageTitle,
        blocks: [section(messageTitle), commentSection, section(pleaseReviewText)].filter(s => !!s)
    };
}
