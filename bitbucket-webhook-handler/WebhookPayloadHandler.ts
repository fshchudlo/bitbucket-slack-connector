import { BitbucketNotification } from "../bitbucket-payload-types";
import { SlackChannel } from "./SlackChannel";

export interface WebhookPayloadHandler {
    canHandle(payload: BitbucketNotification): boolean;

    handle(payload: BitbucketNotification, slackChannel: SlackChannel): Promise<void>;
}