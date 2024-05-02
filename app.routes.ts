import handleBitbucketWebhook from "./bitbucket-webhook-handler/handleBitbucketWebhook";
import { register } from "prom-client";
import { buildChannelName } from "./bitbucket-webhook-handler/buildChannelName";
import { ExpressReceiver } from "@slack/bolt";
import { SlackAPIAdapterCachedDecorator } from "./slack-api-adapter/SlackAPIAdapterCachedDecorator";
import BitbucketWebAPIAdapter from "./payload-normalization/BitbucketWebAPIAdapter";
import { AppConfig } from "./app.config";
import { NextFunction } from "express";
import { WebhookHandlerConfig } from "./bitbucket-webhook-handler/webhookHandlerConfig";
import { normalizeBitbucketWebhookPayload } from "./payload-normalization/normalizeBitbucketWebhookPayload";
import { provisionPullRequestChannel } from "./channel-provisioning/provisionPullRequestChannel";

const bitbucketAPI = new BitbucketWebAPIAdapter(AppConfig.BITBUCKET_BASE_URL, AppConfig.BITBUCKET_READ_API_TOKEN);

export default function configureRoutes(expressReceiver: ExpressReceiver, slackAPI: SlackAPIAdapterCachedDecorator) {

    expressReceiver.router.post("/bitbucket-webhook", async (req, res, next: NextFunction) => {
        try {
            const config = <WebhookHandlerConfig>{
                usePrivateChannels: AppConfig.USE_PRIVATE_CHANNELS,
                defaultChannelParticipants: AppConfig.DEFAULT_CHANNEL_PARTICIPANTS,
                getOpenedPRBroadcastChannelId: AppConfig.getOpenedPRBroadcastChannelId
            };
            const payload = await normalizeBitbucketWebhookPayload(req.body, bitbucketAPI);
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

            const channelInfo = await slackAPI.findChannel(channelName, AppConfig.USE_PRIVATE_CHANNELS);

            channelInfo ? res.send(channelInfo) : res.sendStatus(404);
        } catch (error) {
            next(error);
        }
    });
}