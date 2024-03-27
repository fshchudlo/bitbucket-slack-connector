import "dotenv/config";
import { App, ExpressReceiver } from "@slack/bolt";
import AppConfig from "./app.config";
import { SlackWebClientGateway } from "./gateways/SlackWebClientGateway";
import express from "express";
import handleBitbucketWebhook from "./webhook-handler/handleBitbucketWebhook";
import BitbucketWebAPIGateway from "./gateways/BitbucketWebAPIGateway";
import * as util from "util";
import appConfig from "./app.config";
import { SlackGatewayCachedDecorator } from "./gateways/SlackGatewayCachedDecorator";
import client, { register, collectDefaultMetrics } from "prom-client";

collectDefaultMetrics();

const expressReceiver = new ExpressReceiver({
    signingSecret: AppConfig.SLACK_SIGNING_SECRET
});
expressReceiver.router.use(express.json());

const slackApp = new App({
    token: AppConfig.SLACK_BOT_TOKEN,
    receiver: expressReceiver
});

const slackGateway = new SlackGatewayCachedDecorator(new SlackWebClientGateway(slackApp.client));
const bitbucketGateway = new BitbucketWebAPIGateway(AppConfig.BITBUCKET_BASE_URL, AppConfig.BITBUCKET_API_TOKEN);

new client.Gauge({
    name: "channel_names_cache_hits",
    help: "channel_names_cache_hits",
    collect: function() {
        this.set(slackGateway.channelsCache.cacheHits);
    }
});
new client.Gauge({
    name: "channel_names_cache_misses",
    help: "channel_names_cache_misses",
    collect: function() {
        this.set(slackGateway.channelsCache.cacheMisses);
    }
});
new client.Gauge({
    name: "channel_names_cache_max_size",
    help: "channel_names_cache_max_size",
    collect: function() {
        this.set(slackGateway.channelsCache.maxCacheSize);
    }
});
new client.Gauge({
    name: "channel_names_cache_size",
    help: "channel_names_cache_size",
    collect: function() {
        this.set(slackGateway.channelsCache.cacheSize);
    }
});


expressReceiver.router.post("/bitbucket-webhook", async (req, res) => {
    try {
        await handleBitbucketWebhook(req.body, slackGateway, bitbucketGateway);
        res.sendStatus(200);
    } catch (error) {
        const errorMessage = `Error processing webhook. \n\nError: ${util.inspect(error)}. \n\nPayload: ${util.inspect(req.body)}`;
        console.error(errorMessage);
        try {
            if (appConfig.DIAGNOSTIC_CHANNEL) {
                await slackGateway.sendMessage({
                    channel: appConfig.DIAGNOSTIC_CHANNEL,
                    text: errorMessage
                });
            }
        } catch {

        }
        res.sendStatus(500);
    }
});

expressReceiver.router.get("/metrics", async (req, res) => {
    res.set("Content-Type", register.contentType);
    res.end(await register.metrics());
});


(async () => {
    await slackApp.start(AppConfig.SLACK_BOT_PORT);
    console.log("⚡️ Bitbucket connector app is running!");
})();
