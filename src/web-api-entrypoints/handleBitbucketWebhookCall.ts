import handlePullRequestEvent from "../use-cases/handlePullRequestEvent";
import { buildChannelName } from "../adapters/slack-api/buildChannelName";
import BitbucketAPI from "../adapters/BitbucketAPI";
import { AppConfig } from "../app.config";
import { NextFunction, Request, Response } from "express";
import { normalizeBitbucketPayload } from "./payload-normalization/normalizeBitbucketPayload";
import { SlackChannelProvisioner } from "../adapters/slack-api/SlackChannelProvisioner";
import { PullRequestGenericNotification } from "../use-cases/contracts";

const bitbucketAPI = new BitbucketAPI(AppConfig.BITBUCKET_BASE_URL, AppConfig.BITBUCKET_READ_API_TOKEN);

export async function handleBitbucketWebhookCall(req: Request, res: Response, next: NextFunction, slackChannelFactory: SlackChannelProvisioner) {
    try {
        const payload = await normalizeBitbucketPayload(req.body, bitbucketAPI);
        const broadcastChannelName = AppConfig.getOpenedPRBroadcastChannel(payload);
        const broadcastChannel = broadcastChannelName ? await slackChannelFactory.getBroadcastChannel(broadcastChannelName) : null;


        const provisionResult = await slackChannelFactory.provisionChannelFor(payload, AppConfig.USE_PRIVATE_CHANNELS, AppConfig.DEFAULT_CHANNEL_PARTICIPANTS);

        if (!provisionResult.isSetUpProperly) {
            const payloadToReplay = <PullRequestGenericNotification>{
                eventKey: "pr:opened",
                actor: {
                    name: payload.pullRequest.author.name,
                    email: payload.pullRequest.author.email
                },
                pullRequest: payload.pullRequest
            };
            await handlePullRequestEvent(payloadToReplay, provisionResult.channel, broadcastChannel);

        }

        await handlePullRequestEvent(payload, provisionResult.channel, broadcastChannel);

        res.sendStatus(200);
    } catch (error) {
        next(error);
    }
}

export async function getSlackChannelInfo(req: Request, res: Response, next: NextFunction, slackChannelFactory: SlackChannelProvisioner) {
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

        const channelInfo = await slackChannelFactory.getChannelInfo(channelName);

        channelInfo ? res.send(channelInfo) : res.sendStatus(404);
    } catch (error) {
        next(error);
    }
}
