import "dotenv/config";
import { WebhookHandlerConfig } from "./bitbucket-webhook-handler/webhookHandlerConfig";
import { BitbucketNotification } from "./typings";

export const WebhookConfig: WebhookHandlerConfig = {
    // If you want to use public channels and kick the users removed from PR review, you need to configure Slack permissions properly - https://stackoverflow.com/a/75442078
    usePrivateChannels: true,
    defaultChannelParticipants: process.env.DEFAULT_CHANNEL_PARTICIPANTS?.split(",").map(u => u.trim()),
    /*
    * You can implement any other logic depending on the granularity level you need
    * */
    getOpenedPRBroadcastChannelId(payload: BitbucketNotification): string | null {
        const configuredBotUsers = process.env.BITBUCKET_BOT_USERS?.split(",").map(u => u.trim());
        const projectKey = payload.pullRequest.toRef.repository.project.key;
        const prAuthor = payload.pullRequest.author.user.name;

        let channelName = null;

        if (configuredBotUsers?.find(u => u == prAuthor)) {
            channelName = process.env[`${projectKey.toUpperCase()}_BOT_OPENED_PRS_BROADCAST_CHANNEL_ID`]
                ?? process.env.BOT_OPENED_PRS_BROADCAST_CHANNEL_ID;
        }
        if (!channelName) {
            channelName = process.env[`${projectKey.toUpperCase()}_OPENED_PRS_BROADCAST_CHANNEL_ID`]
                ?? process.env.OPENED_PRS_BROADCAST_CHANNEL_ID;
        }
        return channelName ?? null;
    }
};

export const AppConfig = {
    SLACK_SIGNING_SECRET: process.env.SLACK_SIGNING_SECRET as string,
    SLACK_BOT_TOKEN: process.env.SLACK_BOT_TOKEN,
    SLACK_BOT_PORT: process.env.SLACK_BOT_PORT || 3000,
    BITBUCKET_READ_API_TOKEN: process.env.BITBUCKET_READ_API_TOKEN,
    BITBUCKET_BASE_URL: process.env.BITBUCKET_BASE_URL,
    DIAGNOSTIC_CHANNEL: process.env.DIAGNOSTIC_CHANNEL
};
