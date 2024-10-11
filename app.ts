import { App, ExpressReceiver } from "@slack/bolt";
import { AppConfig } from "./app.config";
import express, { NextFunction } from "express";
import { getSlackChannelInfo, handleBitbucketWebhookCall } from "./web-api-entrypoints/handleBitbucketWebhookCall";
import { SlackChannelProvisioner } from "./adapters/slack-api/SlackChannelProvisioner";
import measureRequestDuration from "./app.metrics";
import logUnhandledError from "./app.errorHandler";
import { register } from "prom-client";
import { handleGithubWebhookCall } from "./web-api-entrypoints/handleGithubWebhookCall";

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

expressReceiver.router.get("/health", async (req, res) => {
    return res.status(200).json({
        status: "UP",
        timestamp: new Date().toISOString()
    });
});

expressReceiver.router.use(async (error: any, req: express.Request, res: express.Response, next: NextFunction) => {
    await logUnhandledError(error, req, res, next, slackApp.client);
});

expressReceiver.app.listen(AppConfig.SLACK_BOT_PORT, AppConfig.SLACK_BOT_HOST, () => {
    console.log(`⚡️ Bitbucket connector app is running on ${AppConfig.SLACK_BOT_HOST}:${AppConfig.SLACK_BOT_PORT}!`);
});
