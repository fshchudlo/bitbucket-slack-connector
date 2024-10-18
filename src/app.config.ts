import "dotenv/config";
import { PullRequestNotification } from "./use-cases/contracts";

export const AppConfig = {
    HMAC_SECRET: process.env.HMAC_SECRET as string,
    SLACK_SIGNING_SECRET: process.env.SLACK_SIGNING_SECRET as string,
    SLACK_BOT_TOKEN: process.env.SLACK_BOT_TOKEN,
    SLACK_BOT_PORT: parseInt(process.env.SLACK_BOT_PORT, 10) || 8080,
    SLACK_BOT_HOST: process.env.SLACK_BOT_HOST || "0.0.0.0",
    BITBUCKET_READ_API_TOKEN: process.env.BITBUCKET_READ_API_TOKEN,
    BITBUCKET_BASE_URL: process.env.BITBUCKET_BASE_URL,
    DIAGNOSTIC_CHANNEL: process.env.DIAGNOSTIC_CHANNEL,
    NODE_ENV: process.env.NODE_ENV,

    /*
    If you want to use public channels and kick the users removed from PR review, you need to configure Slack permissions properly - https://stackoverflow.com/a/75442078
     */
    USE_PRIVATE_CHANNELS: true,
    DEFAULT_CHANNEL_PARTICIPANTS: process.env.DEFAULT_CHANNEL_PARTICIPANTS?.split(",").map(u => u.trim()),
    /*
    * You can implement any other logic depending on the granularity level you need
    * */
    getOpenedPRBroadcastChannel(payload: PullRequestNotification): string | null {
        const configuredBotUsers = process.env.BOT_USER_NAMES?.split(",").map(u => u.trim());
        const projectKey = payload.pullRequest.targetBranch.projectKey;
        const prAuthor = payload.pullRequest.author.name;

        let channelName = null;

        if (configuredBotUsers?.find(u => u == prAuthor)) {
            channelName = process.env[`${projectKey.toUpperCase()}_BOT_OPENED_PRS_BROADCAST_CHANNEL`]
                ?? process.env.BOT_OPENED_PRS_BROADCAST_CHANNEL;
        }
        if (!channelName) {
            channelName = process.env[`${projectKey.toUpperCase()}_OPENED_PRS_BROADCAST_CHANNEL`]
                ?? process.env.OPENED_PRS_BROADCAST_CHANNEL;
        }
        return channelName ?? null;
    },
    getUserEmailFromGithubLogin(login: string): string {
        return login.replace("_webpros", "").split("-").join(".") + "@webpros.com";
    }

};
