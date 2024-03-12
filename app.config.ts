const AppConfig = {
    SLACK_SIGNING_SECRET: process.env.SLACK_SIGNING_SECRET as string,
    SLACK_BOT_TOKEN: process.env.SLACK_BOT_TOKEN,
    SLACK_BOT_PORT: process.env.SLACK_BOT_PORT || 3000,
    BITBUCKET_API_TOKEN: process.env.BITBUCKET_API_TOKEN,
    BITBUCKET_BASE_URL: process.env.BITBUCKET_BASE_URL,
    DIAGNOSTIC_CHANNEL: process.env.DIAGNOSTIC_CHANNEL
};

export default AppConfig;
