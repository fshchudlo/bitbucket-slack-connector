import { SlackTargetedChannel } from "../slack-api-ports";
import { PullRequestNotification } from "../contracts";

export interface WebhookPayloadHandler {
    canHandle(payload: PullRequestNotification): boolean;

    handle(payload: PullRequestNotification, slackChannel: SlackTargetedChannel): Promise<void>;
}