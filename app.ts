import "dotenv/config";
import { App, ExpressReceiver } from "@slack/bolt";
import AppConfig from "./app.config";
import { SlackWebClientGateway } from "./gateways/SlackWebClientGateway";
import express from "express";
import { SlackGatewayCachedDecorator } from "./gateways/SlackGatewayCachedDecorator";
import { collectDefaultMetrics } from "prom-client";
import configureAppMetrics from "./app.metrics";
import configureRoutes from "./app.routes";

const expressReceiver = new ExpressReceiver({
    signingSecret: AppConfig.SLACK_SIGNING_SECRET
});
expressReceiver.router.use(express.json());

const slackApp = new App({
    token: AppConfig.SLACK_BOT_TOKEN,
    receiver: expressReceiver
});

const slackGateway = new SlackGatewayCachedDecorator(new SlackWebClientGateway(slackApp.client));

collectDefaultMetrics();
configureAppMetrics(slackGateway);
configureRoutes(expressReceiver, slackGateway);

(async () => {
    await slackApp.start(AppConfig.SLACK_BOT_PORT);
    console.log("⚡️ Bitbucket connector app is running!");
})();


