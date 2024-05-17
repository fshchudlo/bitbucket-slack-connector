import { SendMessageArguments, SlackChannel } from "../../SlackChannel";
import { PullRequestBasicNotification } from "../../../bitbucket-payload-types";
import { getPullRequestCompletionAction } from "../utils/getPullRequestCompletionAction";
import { WebhookPayloadHandler } from "../../WebhookPayloadHandler";

export class PullRequestCompletionHandler implements WebhookPayloadHandler {
    canHandle(payload: PullRequestBasicNotification): boolean {
        return payload.eventKey == "pr:merged" || payload.eventKey == "pr:declined" || payload.eventKey == "pr:deleted";
    }

    async handle(payload: PullRequestBasicNotification, slackChannel: SlackChannel): Promise<void> {
        const message = buildCompletionMessage(payload);
        await slackChannel.sendMessage(message);

        await slackChannel.closeChannel();
    }
}


function buildCompletionMessage(payload: PullRequestBasicNotification): SendMessageArguments {
    const completionAction = getPullRequestCompletionAction(payload);
    return {
        text: `${completionAction.emoji} ${completionAction.text}`
    };
}