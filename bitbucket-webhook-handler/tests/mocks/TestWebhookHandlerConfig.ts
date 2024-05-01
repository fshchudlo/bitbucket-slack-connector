import { WebhookHandlerConfig } from "../../webhookHandlerConfig";

export const TestWebhookHandlerConfig: WebhookHandlerConfig = {
    getOpenedPRBroadcastChannelId(): string | null {
        return null;
    },
    USE_PRIVATE_CHANNELS: true
};