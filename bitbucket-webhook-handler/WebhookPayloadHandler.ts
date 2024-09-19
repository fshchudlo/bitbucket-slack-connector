import { BitbucketNotification } from "../types/bitbucket-payload-types";

import { SlackTargetedChannel } from "../types/slack-contracts";

export interface WebhookPayloadHandler {
    canHandle(payload: BitbucketNotification): boolean;

    handle(payload: BitbucketNotification, slackChannel: SlackTargetedChannel): Promise<void>;
}