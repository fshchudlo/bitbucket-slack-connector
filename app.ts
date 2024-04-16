import "dotenv/config";
import { App, ExpressReceiver } from "@slack/bolt";
import AppConfig from "./app.config";
import { SlackWebClientAPIAdapter } from "./gateways/SlackWebClientAPIAdapter";
import express from "express";
import { SlackAPIAdapterCachedDecorator } from "./gateways/SlackAPIAdapterCachedDecorator";
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

const slackGateway = new SlackAPIAdapterCachedDecorator(new SlackWebClientAPIAdapter(slackApp.client));

collectDefaultMetrics();
configureRoutes(expressReceiver, slackGateway);
configureErrorHandler(expressReceiver, slackGateway);

(async () => {
    await slackApp.start(AppConfig.SLACK_BOT_PORT);
    console.log("⚡️ Bitbucket connector app is running!");
})();


