import "dotenv/config";
import { App, ExpressReceiver } from "@slack/bolt";
import AppConfig from "./app.config";
import { SlackWebClientGateway } from "./webhook-handler/ports/SlackWebClientGateway";
import express from "express";
import handleBitbucketWebhook from "./webhook-handler/handleBitbucketWebhook";
import BitbucketWebAPIGateway from "./webhook-handler/ports/BitbucketWebAPIGateway";
import * as util from "util";
import appConfig from "./app.config";

const expressReceiver = new ExpressReceiver({
    signingSecret: AppConfig.SLACK_SIGNING_SECRET
});
expressReceiver.router.use(express.json());

const slackApp = new App({
    token: AppConfig.SLACK_BOT_TOKEN,
    receiver: expressReceiver
});
const slackGateway = new SlackWebClientGateway(slackApp.client);
const bitbucketGateway = new BitbucketWebAPIGateway(AppConfig.BITBUCKET_BASE_URL, AppConfig.BITBUCKET_API_TOKEN);

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


(async () => {
    await slackApp.start(AppConfig.SLACK_BOT_PORT);
    console.log("⚡️ Bitbucket connector app is running!");
})();
