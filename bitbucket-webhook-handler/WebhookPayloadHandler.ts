import { BitbucketNotification } from "../bitbucket-payload-types";
import { SlackTargetedChannel } from "./slack-contracts/SlackTargetedChannel";

export interface WebhookPayloadHandler {
    canHandle(payload: BitbucketNotification): boolean;

    handle(payload: BitbucketNotification, slackChannel: SlackTargetedChannel): Promise<void>;
}