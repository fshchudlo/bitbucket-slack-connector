import { App, ExpressReceiver } from "@slack/bolt";
import { AppConfig } from "./app.config";
import express from "express";
import { collectDefaultMetrics } from "prom-client";
import configureRoutes from "./app.routes";
import configureErrorHandler from "./app.errorHandler";
import {
    SlackChannelFactoryCachedDecorator
} from "./slack-api/slack-channel-factory/SlackChannelFactoryCachedDecorator";
import { SlackWebClientChannelFactory } from "./slack-api/slack-channel-factory/SlackWebClientChannelFactory";

const expressReceiver = new ExpressReceiver({
    signingSecret: AppConfig.SLACK_SIGNING_SECRET
});
expressReceiver.router.use(express.json());

const slackApp = new App({
    token: AppConfig.SLACK_BOT_TOKEN,
    receiver: expressReceiver
});

const slackChannelFactory = new SlackChannelFactoryCachedDecorator(new SlackWebClientChannelFactory(slackApp.client));

collectDefaultMetrics();
configureRoutes(expressReceiver, slackChannelFactory);
configureErrorHandler(expressReceiver, slackApp.client);

(async () => {
    await slackApp.start(AppConfig.SLACK_BOT_PORT);
    console.log("⚡️ Bitbucket connector app is running!");
})();


