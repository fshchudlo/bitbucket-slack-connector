import handleBitbucketWebhook from "./bitbucket-webhook-handler/handleBitbucketWebhook";
import { register } from "prom-client";
import { buildChannelName } from "./bitbucket-webhook-handler/buildChannelName";
import { ExpressReceiver } from "@slack/bolt";
import { SlackAPIAdapterCachedDecorator } from "./api-adapters/slack-api-adapter/SlackAPIAdapterCachedDecorator";
import BitbucketWebAPIAdapter from "./api-adapters/bitbucket-gateway/BitbucketWebAPIAdapter";
import { AppConfig, WebhookConfig } from "./app.config";
import { NextFunction } from "express";

const bitbucketAPI = new BitbucketWebAPIAdapter(AppConfig.BITBUCKET_BASE_URL, AppConfig.BITBUCKET_READ_API_TOKEN);

export default function configureRoutes(expressReceiver: ExpressReceiver, slackAPI: SlackAPIAdapterCachedDecorator) {

    expressReceiver.router.post("/bitbucket-webhook", async (req, res, next: NextFunction) => {
        try {
            await handleBitbucketWebhook(req.body, slackAPI, bitbucketAPI, WebhookConfig);
            res.sendStatus(200);
        } catch (error) {
            next(error);
        }
    });

    expressReceiver.router.get("/metrics", async (req, res) => {
        res.set("Content-Type", register.contentType);
        res.end(await register.metrics());
    });

    expressReceiver.router.get("/slack-channel", async (req, res, next: NextFunction) => {
        const { pullRequestId, repositorySlug, projectKey } = req.query;

        if (!pullRequestId || !repositorySlug || !projectKey) {
            return res.status(400).send("Please, specify valid \"pullRequestId\", \"repositorySlug\" and \"projectKey\" as query parameters.");
        }

        try {
            const channelName = buildChannelName({
                pullRequestId: <string>pullRequestId,
                repositorySlug: <string>repositorySlug,
                projectKey: <string>projectKey
            });

            const channelInfo = await slackAPI.findChannel(channelName, WebhookConfig.usePrivateChannels);

            channelInfo ? res.send(channelInfo) : res.sendStatus(404);
        } catch (error) {
            next(error);
        }
    });
}