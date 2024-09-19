import { SlackTargetedChannel } from "../types/slack-contracts";
import { PullRequestNotification } from "../types/normalized-payload-types";

export interface WebhookPayloadHandler {
    canHandle(payload: PullRequestNotification): boolean;

    handle(payload: PullRequestNotification, slackChannel: SlackTargetedChannel): Promise<void>;
}