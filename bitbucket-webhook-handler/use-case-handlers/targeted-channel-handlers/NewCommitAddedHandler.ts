import { link, quote, section } from "../utils/slack-building-blocks";
import { formatUserName, markdownToSlackMarkup, reviewPRAction } from "../utils";
import { PullRequestFromRefUpdatedNotification } from "../../../types/bitbucket-payload-types";
import { WebhookPayloadHandler } from "../../WebhookPayloadHandler";
import { SendMessageArguments, SlackTargetedChannel } from "../../../types/slack-contracts";

export class NewCommitAddedHandler implements WebhookPayloadHandler {
    canHandle(payload: PullRequestFromRefUpdatedNotification) {
        return payload.eventKey == "pr:from_ref_updated";
    }

    async handle(payload: PullRequestFromRefUpdatedNotification, slackChannel: SlackTargetedChannel) {
        await slackChannel.sendMessage(buildSlackMessage(payload));
    }
}

function buildSlackMessage(payload: PullRequestFromRefUpdatedNotification): SendMessageArguments {
    const pullRequest = payload.pullRequest;
    const viewCommitUrl = `${pullRequest.links.self[0].href.replace("/overview", "")}/commits/${pullRequest.fromRef.latestCommit}`;
    const messageTitle = `:new: ${formatUserName(payload.actor)} added ${link(viewCommitUrl, "new commit")}.`;

    const commentSection = payload.latestCommitMessage ? section(`Commit message: \n${quote(markdownToSlackMarkup(payload.latestCommitMessage))}`) : null;
    return {
        text: messageTitle,
        blocks: [section(messageTitle), commentSection, reviewPRAction(payload.pullRequest)].filter(s => !!s)
    };
}
