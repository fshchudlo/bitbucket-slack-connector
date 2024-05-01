import { BitbucketNotification } from "../typings";

export interface WebhookHandlerConfig {
    readonly USE_PRIVATE_CHANNELS: boolean;
    readonly DEFAULT_CHANNEL_PARTICIPANTS?: string[];
    getOpenedPRBroadcastChannelId(payload: BitbucketNotification): string | null;
}