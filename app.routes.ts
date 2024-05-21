import handleWebhookPayload from "./bitbucket-webhook-handler/handleWebhookPayload";
import { buildChannelName } from "./slack-api/buildChannelName";
import BitbucketAPI from "./payload-normalization/BitbucketAPI";
import { AppConfig } from "./app.config";
import { NextFunction, Request, Response } from "express";
import { normalizeBitbucketWebhookPayload } from "./payload-normalization/normalizeBitbucketWebhookPayload";
import { SlackChannelFactory } from "./slack-api/slack-channel-factory/SlackChannelFactory";
import { BitbucketNotification, PullRequestBasicNotification } from "./bitbucket-payload-types";
import { SlackChannel } from "./bitbucket-webhook-handler/SlackChannel";

const bitbucketAPI = new BitbucketAPI(AppConfig.BITBUCKET_BASE_URL, AppConfig.BITBUCKET_READ_API_TOKEN);

export async function handleBitbucketWebhookEvent(req: Request, res: Response, next: NextFunction, slackChannelFactory: SlackChannelFactory) {
    try {
        const payload = await normalizeBitbucketWebhookPayload(req.body, bitbucketAPI);
        const broadcastChannelName = AppConfig.getOpenedPRBroadcastChannel(payload);
        const broadcastChannel = broadcastChannelName ? await slackChannelFactory.fromExistingChannel(broadcastChannelName) : null;


        const provisionResult = await provisionPullRequestChannel(slackChannelFactory, payload);

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

export async function getSlackChannelInfo(req: Request, res: Response, next: NextFunction, slackChannelFactory: SlackChannelFactory) {
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

        const channel = await slackChannelFactory.fromExistingChannel(channelName);

        channel ? res.send(channel.channelInfo) : res.sendStatus(404);
    } catch (error) {
        next(error);
    }
}

async function provisionPullRequestChannel(channelFactory: SlackChannelFactory, payload: BitbucketNotification): Promise<{
    channel: SlackChannel,
    isSetUpProperly: boolean
}> {
    const channelName = buildChannelName(payload.pullRequest);
    if (payload.eventKey == "pr:opened") {
        const newChannel = await channelFactory.setupNewChannel({
            name: channelName,
            isPrivate: AppConfig.USE_PRIVATE_CHANNELS,
            defaultParticipants: AppConfig.DEFAULT_CHANNEL_PARTICIPANTS
        });
        return {
            channel: newChannel,
            isSetUpProperly: true
        };
    }
    const existingChannel = await channelFactory.fromExistingChannel(channelName);
    if (existingChannel != null) {
        return {
            channel: existingChannel,
            isSetUpProperly: true
        };

    }

    const createdChannel = await channelFactory.setupNewChannel({
        name: channelName,
        isPrivate: AppConfig.USE_PRIVATE_CHANNELS,
        defaultParticipants: AppConfig.DEFAULT_CHANNEL_PARTICIPANTS
    });
    return { channel: createdChannel, isSetUpProperly: false };
}