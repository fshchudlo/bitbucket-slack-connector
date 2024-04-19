import handleBitbucketWebhook from "./webhook-handler/handleBitbucketWebhook";
import { register } from "prom-client";
import { buildChannelName } from "./webhook-handler/slack-helpers";
import { ExpressReceiver } from "@slack/bolt";
import { SlackAPIAdapterCachedDecorator } from "./adapters/slack-api-adapter/SlackAPIAdapterCachedDecorator";
import BitbucketWebAPIGateway from "./adapters/bitbucket-gateway/BitbucketWebAPIGateway";
import AppConfig from "./app.config";
import { NextFunction } from "express";

const bitbucketGateway = new BitbucketWebAPIGateway(AppConfig.BITBUCKET_BASE_URL, AppConfig.BITBUCKET_API_TOKEN);

export default function configureRoutes(expressReceiver: ExpressReceiver, slackAPI: SlackAPIAdapterCachedDecorator) {

    expressReceiver.router.post("/bitbucket-webhook", async (req, res, next: NextFunction) => {
        try {
            await handleBitbucketWebhook(req.body, slackAPI, bitbucketGateway);
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
            const channelInfo = await slackAPI.findChannel(channelName, false);
            channelInfo ? res.send(channelInfo) : res.sendStatus(404);
        } catch (error) {
            next(error);
        }
    });
}