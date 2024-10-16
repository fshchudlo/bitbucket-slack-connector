import { App, ExpressReceiver } from "@slack/bolt";
import { AppConfig } from "./app.config";
import express, { NextFunction } from "express";
import { getSlackChannelInfo, handleBitbucketWebhookCall } from "./web-api-entrypoints/handleBitbucketWebhookCall";
import { SlackChannelProvisioner } from "./adapters/slack-api/SlackChannelProvisioner";
import measureRequestDuration from "./app.metrics";
import logErrorMessage from "./web-api-helpers/logErrorMessage";
import { register } from "prom-client";
import { handleGithubWebhookCall } from "./web-api-entrypoints/handleGithubWebhookCall";
import bodyParser from "body-parser";
import verifyHMACSignature from "./web-api-helpers/verifyHMACSignature";
import util from "util";


const expressReceiver = new ExpressReceiver({
    signingSecret: AppConfig.SLACK_SIGNING_SECRET
});

const slackApp = new App({
    token: AppConfig.SLACK_BOT_TOKEN,
    receiver: expressReceiver
});

const slackChannelFactory = new SlackChannelProvisioner(slackApp.client);

if (AppConfig.HMAC_SECRET) {
    expressReceiver.router.use(bodyParser.json({
        verify: (req: Request, _res: Response, buf: Buffer) => {
            (req as any).rawBody = buf.toString();
        }
    } as any));
} else {
    expressReceiver.router.use(express.json());
}
expressReceiver.router.use(measureRequestDuration);

expressReceiver.router.post("/bitbucket-webhook", verifyHMACSignature, async (req, res, next: NextFunction) => {
    await handleBitbucketWebhookCall(req, res, next, slackChannelFactory);
});

expressReceiver.router.post("/github-webhook", verifyHMACSignature, async (req, res, next: NextFunction) => {
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
    const errorMessage = ["Error processing webhook.", `Error: ${util.inspect(error, false, 8)}.`, `Payload: ${util.inspect(req.body, false, 8)}`].join("\n\n");
    await logErrorMessage(errorMessage, slackApp.client);

    if (res.headersSent) {
        return next(error);
    } else {
        res.status(500).send(AppConfig.NODE_ENV == "development" ? errorMessage : "Internal server error");
    }
});

expressReceiver.app.listen(AppConfig.SLACK_BOT_PORT, AppConfig.SLACK_BOT_HOST, () => {
    console.log(`⚡️ Bitbucket connector app is running on ${AppConfig.SLACK_BOT_HOST}:${AppConfig.SLACK_BOT_PORT}!`);
});