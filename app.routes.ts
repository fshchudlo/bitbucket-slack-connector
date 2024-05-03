import sendTargetNotificationToSlack from "./bitbucket-webhook-handler/handleBitbucketWebhook";
import { register } from "prom-client";
import { buildChannelName } from "./slack-api-adapters/buildChannelName";
import { ExpressReceiver } from "@slack/bolt";
import BitbucketAPI from "./payload-normalization/BitbucketAPI";
import { AppConfig } from "./app.config";
import { NextFunction, Request, Response } from "express";
import { normalizeBitbucketWebhookPayload } from "./payload-normalization/normalizeBitbucketWebhookPayload";
import { provisionPullRequestChannel } from "./slack-api-adapters/provisionPullRequestChannel";
import { SlackChannelFactory } from "./slack-api-adapters/slack-channel-factory/SlackChannelFactory";

const bitbucketAPI = new BitbucketAPI(AppConfig.BITBUCKET_BASE_URL, AppConfig.BITBUCKET_READ_API_TOKEN);

export default function configureRoutes(expressReceiver: ExpressReceiver, slackChannelFactory: SlackChannelFactory) {
    expressReceiver.router.post("/bitbucket-webhook", async (req, res, next: NextFunction) => {
        await handleBitbucketWebhookEvent(req, res, next, slackChannelFactory);
    });
    expressReceiver.router.get("/metrics", async (req, res) => {
        res.set("Content-Type", register.contentType);
        res.end(await register.metrics());
    });
    expressReceiver.router.get("/slack-channel", async (req, res, next: NextFunction) => {
        return await getSlackChannelInfo(req, res, next, slackChannelFactory);
    });
}

async function handleBitbucketWebhookEvent(req: Request, res: Response, next: NextFunction, slackChannelFactory: SlackChannelFactory) {
    try {
        const payload = await normalizeBitbucketWebhookPayload(req.body, bitbucketAPI);
        const broadcastChannelName = AppConfig.getOpenedPRBroadcastChannel(payload);
        const broadcastChannel = broadcastChannelName ? await slackChannelFactory.fromExistingChannel(broadcastChannelName, true) : null;


        const pullRequestChannel = await provisionPullRequestChannel(slackChannelFactory, broadcastChannel, payload);


        await sendTargetNotificationToSlack(payload, pullRequestChannel, broadcastChannel, AppConfig.DEFAULT_CHANNEL_PARTICIPANTS);

        res.sendStatus(200);
    } catch (error) {
        next(error);
    }
}

async function getSlackChannelInfo(req: Request, res: Response, next: NextFunction, slackChannelFactory: SlackChannelFactory) {
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
}
