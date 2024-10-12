
import { PullRequestGenericNotification } from "../../contracts";
import { getPullRequestCompletionAction } from "../utils/getPullRequestCompletionAction";
import { WebhookPayloadHandler } from "../WebhookPayloadHandler";
import { SendMessageArguments, SlackTargetedChannel } from "../../slack-api-ports";

export class PullRequestCompletionHandler implements WebhookPayloadHandler {
    canHandle(payload: PullRequestGenericNotification): boolean {
        return payload.eventKey == "pr:merged" || payload.eventKey == "pr:declined" || payload.eventKey == "pr:deleted";
    }

    async handle(payload: PullRequestGenericNotification, slackChannel: SlackTargetedChannel): Promise<void> {
        const message = buildCompletionMessage(payload);
        await slackChannel.sendMessage(message);

        await slackChannel.closeChannel();
    }
}


function buildCompletionMessage(payload: PullRequestGenericNotification): SendMessageArguments {
    const completionAction = getPullRequestCompletionAction(payload);
    return {
        text: `${completionAction.emoji} ${completionAction.text}`
    };
}