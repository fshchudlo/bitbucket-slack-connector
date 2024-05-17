import { link, quote, section } from "./slack-building-blocks";
import { formatUserName, markdownToSlackMarkup, reviewPRAction } from "./helpers";
import { SendMessageArguments, SlackChannel } from "../SlackChannel";
import { PullRequestFromRefUpdatedNotification } from "../../bitbucket-payload-types";

export async function sendMessageAboutNewCommit(payload: PullRequestFromRefUpdatedNotification, slackChannel: SlackChannel) {
    const message = buildMessage(payload);
    await slackChannel.sendMessage(message);
}

function buildMessage(payload: PullRequestFromRefUpdatedNotification): SendMessageArguments {
    const pullRequest = payload.pullRequest;
    const viewCommitUrl = `${pullRequest.links.self[0].href.replace("/overview", "")}/commits/${pullRequest.fromRef.latestCommit}`;
    const messageTitle = `:new: ${formatUserName(payload.actor)} added ${link(viewCommitUrl, "new commit")}.`;

    const commentSection = payload.latestCommitMessage ? section(`Commit message: \n${quote(markdownToSlackMarkup(payload.latestCommitMessage))}`) : null;
    return {
        text: messageTitle,
        blocks: [section(messageTitle), commentSection, reviewPRAction(payload.pullRequest)].filter(s => !!s)
    };
}
