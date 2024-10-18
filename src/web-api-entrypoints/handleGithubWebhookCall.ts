import { NextFunction, Request, Response } from "express";
import { SlackChannelProvisioner } from "../adapters/slack-api/SlackChannelProvisioner";
import { normalizeGithubPayload } from "./payload-normalization/normalizeGithubPayload";
import { AppConfig } from "../app.config";
import { PullRequestNotification } from "../use-cases/contracts";
import handlePullRequestEvent from "../use-cases/handlePullRequestEvent";
import { SlackUserIdResolver } from "./payload-normalization/ports/SlackUserIdResolver";

export async function handleGithubWebhookCall(req: Request, res: Response, next: NextFunction, slackChannelFactory: SlackChannelProvisioner, slackUserIdResolver: SlackUserIdResolver) {
    try {
        const payload = await normalizeGithubPayload(req.body, slackUserIdResolver);
        const broadcastChannelName = AppConfig.getOpenedPRBroadcastChannel(payload);
        const broadcastChannel = broadcastChannelName ? await slackChannelFactory.getBroadcastChannel(broadcastChannelName) : null;


        const provisionResult = await slackChannelFactory.provisionChannelFor(payload, AppConfig.USE_PRIVATE_CHANNELS, AppConfig.DEFAULT_CHANNEL_PARTICIPANTS);

        if (!provisionResult.isSetUpProperly) {
            const payloadToReplay = <PullRequestNotification>{
                eventKey: "pr:opened",
                actor: {
                    name: payload.pullRequest.author.name,
                    slackUserId: payload.pullRequest.author.slackUserId
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