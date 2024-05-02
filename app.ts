import { App, ExpressReceiver } from "@slack/bolt";
import { AppConfig } from "./app.config";
import express from "express";
import { collectDefaultMetrics } from "prom-client";
import configureRoutes from "./app.routes";
import configureErrorHandler from "./app.errorHandler";

const expressReceiver = new ExpressReceiver({
    signingSecret: AppConfig.SLACK_SIGNING_SECRET
});
expressReceiver.router.use(express.json());

const slackApp = new App({
    token: AppConfig.SLACK_BOT_TOKEN,
    receiver: expressReceiver
});

collectDefaultMetrics();
configureRoutes(expressReceiver, slackApp.client);
configureErrorHandler(expressReceiver, slackApp.client);

(async () => {
    await slackApp.start(AppConfig.SLACK_BOT_PORT);
    console.log("⚡️ Bitbucket connector app is running!");
})();


