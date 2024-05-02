import { iconEmoji, link, quote, section } from "./slack-building-blocks";
import { formatUserName, markdownToSlackMarkup, reviewPRAction } from "./helpers";
import { SendMessageArguments, SlackAPIAdapter } from "../ports/SlackAPIAdapter";
import { PullRequestFromRefUpdatedPayload } from "../../bitbucket-payload-types";

export async function sendMessageAboutNewCommit(payload: PullRequestFromRefUpdatedPayload, slackAPI: SlackAPIAdapter, slackChannelId: string) {
    const message = buildMessage(payload, slackChannelId);
    await slackAPI.sendMessage(message);
}

function buildMessage(payload: PullRequestFromRefUpdatedPayload, slackChannelId: string): SendMessageArguments {
    const pullRequest = payload.pullRequest;
    const viewCommitUrl = `${pullRequest.links.self[0].href.replace("/overview", "")}/commits/${pullRequest.fromRef.latestCommit}`;
    const messageTitle = `:new: ${formatUserName(payload.actor)} added ${link(viewCommitUrl, "new commit")}.`;

    const commentSection = payload.latestCommitMessage ? section(`Commit message: \n${quote(markdownToSlackMarkup(payload.latestCommitMessage))}`) : null;
    return {
        channelId: slackChannelId,
        iconEmoji: iconEmoji,
        text: messageTitle,
        blocks: [section(messageTitle), commentSection, reviewPRAction(payload.pullRequest)].filter(s => !!s)
    };
}
