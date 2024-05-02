import { WebhookHandlerConfig } from "../bitbucket-webhook-handler/webhookHandlerConfig";

export const TestWebhookHandlerConfig: WebhookHandlerConfig = {
    getOpenedPRBroadcastChannelId(): string | null {
        return null;
    },
    usePrivateChannels: true
};