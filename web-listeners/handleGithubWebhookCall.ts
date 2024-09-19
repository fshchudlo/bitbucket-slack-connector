import { NextFunction, Request, Response } from "express";
import { SlackChannelProvisioner } from "../slack-api/SlackChannelProvisioner";
import { normalizeGithubPayload } from "../payload-normalization/normalizeGithubPayload";
import { AppConfig } from "../app.config";
import { PullRequestBasicNotification } from "../types/bitbucket-payload-types";
import handleWebhookPayload from "../bitbucket-webhook-handler/handleWebhookPayload";

export async function handleGithubWebhookCall(req: Request, res: Response, next: NextFunction, slackChannelFactory: SlackChannelProvisioner) {
    try {
        const payload = await normalizeGithubPayload(req.body);
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