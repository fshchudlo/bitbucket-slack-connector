import { iconEmoji, link, quote, section } from "./slack-building-blocks";
import { formatUserName, markdownToSlackMarkup, reviewPRAction } from "./helpers";
import { SendMessageArguments, SlackChannel } from "../SlackChannel";
import { PullRequestFromRefUpdatedPayload } from "../../bitbucket-payload-types";

export async function sendMessageAboutNewCommit(payload: PullRequestFromRefUpdatedPayload, slackChannel: SlackChannel) {
    const message = buildMessage(payload);
    await slackChannel.sendMessage(message);
}

function buildMessage(payload: PullRequestFromRefUpdatedPayload): SendMessageArguments {
    const pullRequest = payload.pullRequest;
    const viewCommitUrl = `${pullRequest.links.self[0].href.replace("/overview", "")}/commits/${pullRequest.fromRef.latestCommit}`;
    const messageTitle = `:new: ${formatUserName(payload.actor)} added ${link(viewCommitUrl, "new commit")}.`;

    const commentSection = payload.latestCommitMessage ? section(`Commit message: \n${quote(markdownToSlackMarkup(payload.latestCommitMessage))}`) : null;
    return {
        iconEmoji: iconEmoji,
        text: messageTitle,
        blocks: [section(messageTitle), commentSection, reviewPRAction(payload.pullRequest)].filter(s => !!s)
    };
}
