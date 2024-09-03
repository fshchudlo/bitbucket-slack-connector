import handleWebhookPayload from "./bitbucket-webhook-handler/handleWebhookPayload";
import { buildChannelName } from "./slack-api/buildChannelName";
import BitbucketAPI from "./payload-normalization/BitbucketAPI";
import { AppConfig } from "./app.config";
import { NextFunction, Request, Response } from "express";
import { normalizeBitbucketWebhookPayload } from "./payload-normalization/normalizeBitbucketWebhookPayload";
import { SlackChannelProvisioner } from "./slack-api/SlackChannelProvisioner";
import { PullRequestBasicNotification } from "./bitbucket-payload-types";

const bitbucketAPI = new BitbucketAPI(AppConfig.BITBUCKET_BASE_URL, AppConfig.BITBUCKET_READ_API_TOKEN);

export async function handleBitbucketWebhookEvent(req: Request, res: Response, next: NextFunction, slackChannelFactory: SlackChannelProvisioner) {
    try {
        const payload = await normalizeBitbucketWebhookPayload(req.body, bitbucketAPI);
        const broadcastChannelName = AppConfig.getOpenedPRBroadcastChannel(payload);
        const broadcastChannel = broadcastChannelName ? await slackChannelFactory.getBroadcastChannel(broadcastChannelName) : null;


        const provisionResult = await slackChannelFactory.provisionChannelFor(payload, AppConfig.USE_PRIVATE_CHANNELS, AppConfig.DEFAULT_CHANNEL_PARTICIPANTS);

        if (!provisionResult.isSetUpProperly) {
            const payloadToReplay = <PullRequestBasicNotification>{
                eventKey: "pr:opened",
                actor: {
                    displayName: payload.pullRequest.author.user.displayName,
                    emailAddress: payload.pullRequest.author.user.emailAddress
                },
                pullRequest: payload.pullRequest
            };
            await handleWebhookPayload(payloadToReplay, provisionResult.channel, broadcastChannel);

        }

        await handleWebhookPayload(payload, provisionResult.channel, broadcastChannel);

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

        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        channelInfo ? res.send(channelInfo) : res.sendStatus(404);
    } catch (error) {
        next(error);
    }
}
