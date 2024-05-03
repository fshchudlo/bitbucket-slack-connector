import handleBitbucketWebhook from "./bitbucket-webhook-handler/handleBitbucketWebhook";
import { register } from "prom-client";
import { buildChannelName } from "./channel-provisioning/buildChannelName";
import { ExpressReceiver } from "@slack/bolt";
import { SlackAPIAdapterCachedDecorator } from "./slack-api-adapter/SlackAPIAdapterCachedDecorator";
import BitbucketAPI from "./payload-normalization/BitbucketAPI";
import { AppConfig } from "./app.config";
import { NextFunction } from "express";
import { WebhookHandlerConfig } from "./bitbucket-webhook-handler/webhookHandlerConfig";
import { normalizeBitbucketWebhookPayload } from "./payload-normalization/normalizeBitbucketWebhookPayload";
import { provisionPullRequestChannel } from "./channel-provisioning/provisionPullRequestChannel";
import { WebClient } from "@slack/web-api";
import { SlackWebClientChannel } from "./slack-api-adapter/SlackWebClientChannel";
import { SlackWebClientChannelFactory } from "./slack-api-adapter/SlackWebClientChannelFactory";

const bitbucketAPI = new BitbucketAPI(AppConfig.BITBUCKET_BASE_URL, AppConfig.BITBUCKET_READ_API_TOKEN);

export default function configureRoutes(expressReceiver: ExpressReceiver, slackClient: WebClient) {
    const config = <WebhookHandlerConfig>{
        usePrivateChannels: AppConfig.USE_PRIVATE_CHANNELS,
        defaultChannelParticipants: AppConfig.DEFAULT_CHANNEL_PARTICIPANTS,
        getOpenedPRBroadcastChannelId: AppConfig.getOpenedPRBroadcastChannelId
    };

    expressReceiver.router.post("/bitbucket-webhook", async (req, res, next: NextFunction) => {
        try {
            const payload = await normalizeBitbucketWebhookPayload(req.body, bitbucketAPI);

            const slackChannel = new SlackWebClientChannel(slackClient);
            const slackChannelFactory = new SlackWebClientChannelFactory(slackClient);
            const slackAPI = new SlackAPIAdapterCachedDecorator(slackChannel, slackChannelFactory);

            const channelInfo = await provisionPullRequestChannel(slackAPI, slackAPI, payload, config);

            await handleBitbucketWebhook(payload, slackAPI, channelInfo, config);
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

            const slackChannel = new SlackWebClientChannel(slackClient);
            const slackChannelFactory = new SlackWebClientChannelFactory(slackClient);
            const slackAPI = new SlackAPIAdapterCachedDecorator(slackChannel, slackChannelFactory);


            const channelInfo = await slackAPI.findChannel(channelName, AppConfig.USE_PRIVATE_CHANNELS);

            channelInfo ? res.send(channelInfo) : res.sendStatus(404);
        } catch (error) {
            next(error);
        }
    });
}