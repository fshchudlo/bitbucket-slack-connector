export type WebhookHandlerConfig = {
    readonly USE_PRIVATE_CHANNELS: boolean;
    readonly DEFAULT_CHANNEL_PARTICIPANTS?: string[];
    readonly BROADCAST_OPENED_PR_MESSAGES_TO_CHANNEL_ID?: string;
}