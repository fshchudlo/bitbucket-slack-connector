import handleBitbucketWebhook from "./bitbucket-webhook-handler/handleBitbucketWebhook";
import { register } from "prom-client";
import { buildChannelName } from "./channel-provisioning/buildChannelName";
import { ExpressReceiver } from "@slack/bolt";
import BitbucketAPI from "./payload-normalization/BitbucketAPI";
import { AppConfig } from "./app.config";
import { NextFunction } from "express";
import { normalizeBitbucketWebhookPayload } from "./payload-normalization/normalizeBitbucketWebhookPayload";
import { provisionNotificationChannel } from "./channel-provisioning/provisionNotificationChannel";
import { WebClient } from "@slack/web-api";
import { SlackWebClientChannelFactory } from "./slack-api-adapter/SlackWebClientChannelFactory";
import { SlackChannelFactoryCachedDecorator } from "./slack-api-adapter/SlackChannelFactoryCachedDecorator";

const bitbucketAPI = new BitbucketAPI(AppConfig.BITBUCKET_BASE_URL, AppConfig.BITBUCKET_READ_API_TOKEN);

export default function configureRoutes(expressReceiver: ExpressReceiver, slackClient: WebClient) {
    const slackChannelFactory = new SlackChannelFactoryCachedDecorator(new SlackWebClientChannelFactory(slackClient));

    expressReceiver.router.post("/bitbucket-webhook", async (req, res, next: NextFunction) => {
        try {
            const payload = await normalizeBitbucketWebhookPayload(req.body, bitbucketAPI);
            const broadcastChannelName = AppConfig.getOpenedPRBroadcastChannel(payload);
            const broadcastChannel = broadcastChannelName ? await slackChannelFactory.fromExistingChannel(broadcastChannelName, true) : null;


            const pullRequestChannel = await provisionNotificationChannel(slackChannelFactory, broadcastChannel, payload);


            await handleBitbucketWebhook(payload, pullRequestChannel, broadcastChannel, AppConfig.DEFAULT_CHANNEL_PARTICIPANTS);

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

            const channel = await slackChannelFactory.fromExistingChannel(channelName, AppConfig.USE_PRIVATE_CHANNELS);

            channel ? res.send(channel.channelInfo) : res.sendStatus(404);
        } catch (error) {
            next(error);
        }
    });
}