import { iconEmoji, link, quote, section } from "./slack-building-blocks";
import { formatUserName, markdownToSlackMarkup, reviewPRAction } from "./helpers";
import { SendMessageArguments, SlackAPIAdapter } from "../ports/SlackAPIAdapter";
import { BitbucketAPIAdapter } from "../ports/BitbucketAPIAdapter";
import { PullRequestBasicNotification } from "../../typings";

export async function sendMessageAboutNewCommit(payload: PullRequestBasicNotification, slackAPI: SlackAPIAdapter, bitbucketAPI: BitbucketAPIAdapter, slackChannelId: string) {
    const commentInBitbucket = bitbucketAPI.canRead() ? await bitbucketAPI.fetchCommitMessage(payload.pullRequest.fromRef.repository.project.key, payload.pullRequest.fromRef.repository.slug, payload.pullRequest.fromRef.latestCommit) : null;
    const message = buildMessage(payload, commentInBitbucket, slackChannelId);
    await slackAPI.sendMessage(message);
}

function buildMessage(payload: PullRequestBasicNotification, commentInBitbucket: string | null, slackChannelId: string): SendMessageArguments {
    const pullRequest = payload.pullRequest;
    const viewCommitUrl = `${pullRequest.links.self[0].href.replace("/overview", "")}/commits/${pullRequest.fromRef.latestCommit}`;
    const messageTitle = `:new: ${formatUserName(payload.actor)} added ${link(viewCommitUrl, "new commit")}.`;

    const commentSection = commentInBitbucket ? section(`Commit message: \n${quote(markdownToSlackMarkup(commentInBitbucket))}`) : null;
    return {
        channelId: slackChannelId,
        iconEmoji: iconEmoji,
        text: messageTitle,
        blocks: [section(messageTitle), commentSection, reviewPRAction(payload.pullRequest)].filter(s => !!s)
    };
}
