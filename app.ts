import { App, ExpressReceiver } from "@slack/bolt";
import { AppConfig } from "./app.config";
import { SlackWebClientNotificationChannelManager } from "./slack-api-adapter/SlackWebClientNotificationChannelManager";
import express from "express";
import { SlackAPIAdapterCachedDecorator } from "./slack-api-adapter/SlackAPIAdapterCachedDecorator";
import { collectDefaultMetrics } from "prom-client";
import configureRoutes from "./app.routes";
import configureErrorHandler from "./app.errorHandler";
import { SlackWebClientChannelFactory } from "./slack-api-adapter/SlackWebClientChannelFactory";

const expressReceiver = new ExpressReceiver({
    signingSecret: AppConfig.SLACK_SIGNING_SECRET
});
expressReceiver.router.use(express.json());

const slackApp = new App({
    token: AppConfig.SLACK_BOT_TOKEN,
    receiver: expressReceiver
});

const slackAPIWebAdapter = new SlackWebClientNotificationChannelManager(slackApp.client);
const slackChannelFactory = new SlackWebClientChannelFactory(slackApp.client);
const slackAPI = new SlackAPIAdapterCachedDecorator(slackAPIWebAdapter, slackChannelFactory);

collectDefaultMetrics();
configureRoutes(expressReceiver, slackAPI);
configureErrorHandler(expressReceiver, slackAPI);

(async () => {
    await slackApp.start(AppConfig.SLACK_BOT_PORT);
    console.log("⚡️ Bitbucket connector app is running!");
})();


