import "dotenv/config";
import { WebhookHandlerConfig } from "./webhook-handler/webhookHandlerConfig";

export type AppConfig = WebhookHandlerConfig & {
    readonly SLACK_SIGNING_SECRET: string;
    readonly SLACK_BOT_TOKEN: string;
    readonly SLACK_BOT_PORT: string | number;
    readonly BITBUCKET_READ_API_TOKEN: string;
    readonly BITBUCKET_BASE_URL: string;
    readonly DIAGNOSTIC_CHANNEL: string;
}

const AppConfig: AppConfig = {
    SLACK_SIGNING_SECRET: process.env.SLACK_SIGNING_SECRET as string,
    SLACK_BOT_TOKEN: process.env.SLACK_BOT_TOKEN,
    SLACK_BOT_PORT: process.env.SLACK_BOT_PORT || 3000,
    BITBUCKET_READ_API_TOKEN: process.env.BITBUCKET_READ_API_TOKEN,
    BITBUCKET_BASE_URL: process.env.BITBUCKET_BASE_URL,
    DIAGNOSTIC_CHANNEL: process.env.DIAGNOSTIC_CHANNEL,
    // If you want to use public channels, you need to configure Slack permissions properly - https://stackoverflow.com/a/75442078
    USE_PRIVATE_CHANNELS: true,
    DEFAULT_CHANNEL_PARTICIPANTS: process.env.DEFAULT_CHANNEL_PARTICIPANTS?.split(",").map(u => u.trim()),
    BROADCAST_OPENED_PR_MESSAGES_TO_CHANNEL_ID: process.env.BROADCAST_OPENED_PR_MESSAGES_TO_CHANNEL_ID
};

export default AppConfig;