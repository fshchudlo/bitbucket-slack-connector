import { BitbucketNotification } from "../typings";

export interface WebhookHandlerConfig {
    readonly usePrivateChannels: boolean;
    readonly defaultChannelParticipants?: string[];
    getOpenedPRBroadcastChannelId(payload: BitbucketNotification): string | null;
}