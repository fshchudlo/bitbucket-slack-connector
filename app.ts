import { App, ExpressReceiver } from "@slack/bolt";
import { AppConfig } from "./app.config";
import express, { NextFunction } from "express";
import { getSlackChannelInfo, handleBitbucketWebhookCall } from "./web-api-handlers/handleBitbucketWebhookCall";
import { SlackChannelProvisioner } from "./slack-api-adapters/SlackChannelProvisioner";
import measureRequestDuration from "./app.metrics";
import logUnhandledError from "./app.errorHandler";
import { register } from "prom-client";
import { handleGithubWebhookCall } from "./web-api-handlers/handleGithubWebhookCall";

const expressReceiver = new ExpressReceiver({
    signingSecret: AppConfig.SLACK_SIGNING_SECRET
});
expressReceiver.router.use(express.json());

const slackApp = new App({
    token: AppConfig.SLACK_BOT_TOKEN,
    receiver: expressReceiver
});

const slackChannelFactory = new SlackChannelProvisioner(slackApp.client);

expressReceiver.router.use(measureRequestDuration);

expressReceiver.router.post("/bitbucket-webhook", async (req, res, next: NextFunction) => {
    await handleBitbucketWebhookCall(req, res, next, slackChannelFactory);
});

expressReceiver.router.post("/github-webhook", async (req, res, next: NextFunction) => {
    await handleGithubWebhookCall(req, res, next, slackChannelFactory);
});

expressReceiver.router.get("/metrics", async (req, res) => {
    res.set("Content-Type", register.contentType);
    res.end(await register.metrics());
});
expressReceiver.router.get("/slack-channel", async (req, res, next: NextFunction) => {
    return await getSlackChannelInfo(req, res, next, slackChannelFactory);
});

expressReceiver.router.use(async (error: any, req: express.Request, res: express.Response, next: NextFunction) => {
    await logUnhandledError(error, req, res, next, slackApp.client);
});

(async () => {
    await slackApp.start(AppConfig.SLACK_BOT_PORT);
    console.log("⚡️ Bitbucket connector app is running!");
})();


