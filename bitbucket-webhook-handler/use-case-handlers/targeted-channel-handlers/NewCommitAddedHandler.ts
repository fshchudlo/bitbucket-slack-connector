import { link, quote, section } from "../utils/slack-building-blocks";
import { formatUserName, markdownToSlackMarkup, reviewPRAction } from "../utils";
import { PullRequestFromBranchUpdatedNotification } from "../../../types/normalized-payload-types";
import { WebhookPayloadHandler } from "../../WebhookPayloadHandler";
import { SendMessageArguments, SlackTargetedChannel } from "../../../types/slack-contracts";

export class NewCommitAddedHandler implements WebhookPayloadHandler {
    canHandle(payload: PullRequestFromBranchUpdatedNotification) {
        return payload.eventKey == "pr:from_ref_updated";
    }

    async handle(payload: PullRequestFromBranchUpdatedNotification, slackChannel: SlackTargetedChannel) {
        await slackChannel.sendMessage(buildSlackMessage(payload));
    }
}

function buildSlackMessage(payload: PullRequestFromBranchUpdatedNotification): SendMessageArguments {
    const messageTitle = `:new: ${formatUserName(payload.actor)} added ${link(payload.latestCommitViewUrl, "new commit")}.`;

    const commentSection = payload.latestCommitMessage ? section(`Commit message: \n${quote(markdownToSlackMarkup(payload.latestCommitMessage))}`) : null;
    return {
        text: messageTitle,
        blocks: [section(messageTitle), commentSection, reviewPRAction(payload.pullRequest)].filter(s => !!s)
    };
}
