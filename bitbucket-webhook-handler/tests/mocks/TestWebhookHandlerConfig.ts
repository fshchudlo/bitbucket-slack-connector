import { WebhookHandlerConfig } from "../../webhookHandlerConfig";

export const TestWebhookHandlerConfig: WebhookHandlerConfig = {
    getOpenedPRBroadcastChannelId(): string | null {
        return null;
    },
    usePrivateChannels: true
};