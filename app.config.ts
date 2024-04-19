import "dotenv/config";

const AppConfig = {
    SLACK_SIGNING_SECRET: process.env.SLACK_SIGNING_SECRET as string,
    SLACK_BOT_TOKEN: process.env.SLACK_BOT_TOKEN,
    SLACK_BOT_PORT: process.env.SLACK_BOT_PORT || 3000,
    BITBUCKET_API_TOKEN: process.env.BITBUCKET_API_TOKEN,
    BITBUCKET_BASE_URL: process.env.BITBUCKET_BASE_URL,
    DIAGNOSTIC_CHANNEL: process.env.DIAGNOSTIC_CHANNEL,
    // If you want to use public channels, you need to configure Slack permissions properly - https://stackoverflow.com/a/75442078
    USE_PRIVATE_CHANNELS: true,
    DEFAULT_CHANNEL_PARTICIPANTS: process.env.DEFAULT_CHANNEL_PARTICIPANTS?.split(",").map(u => u.trim())
};

export default AppConfig;
