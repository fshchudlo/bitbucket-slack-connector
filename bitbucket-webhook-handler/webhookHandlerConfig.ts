import { BitbucketNotification } from "../bitbucket-payload-types";

export interface WebhookHandlerConfig {
    readonly usePrivateChannels: boolean;
    readonly defaultChannelParticipants?: string[];
    getOpenedPRBroadcastChannelId(payload: BitbucketNotification): string | null;
}