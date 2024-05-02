import { SlackAPIAdapter } from "./ports/SlackAPIAdapter";
import { BitbucketNotification, PullRequestBasicNotification } from "../bitbucket-payload-types";
import { WebhookHandlerConfig } from "./webhookHandlerConfig";
import { buildChannelName } from "./buildChannelName";
import handleBitbucketWebhook from "./handleBitbucketWebhook";

export async function provisionPullRequestChannel(slackAPI: SlackAPIAdapter, payload: BitbucketNotification, config: WebhookHandlerConfig) {
    const channelName = buildChannelName(payload.pullRequest);
    if (payload.eventKey == "pr:opened") {
        return await slackAPI.createChannel({ name: channelName, isPrivate: config.usePrivateChannels });
    }
    const existingChannel = await slackAPI.findChannel(channelName, config.usePrivateChannels);
    if (existingChannel != null) {
        return existingChannel;
    }

    const prOpenedPayload = <PullRequestBasicNotification>{
        eventKey: "pr:opened",
        actor: {
            displayName: payload.pullRequest.author.user.displayName,
            emailAddress: payload.pullRequest.author.user.emailAddress
        },
        pullRequest: payload.pullRequest
    };
    await handleBitbucketWebhook(prOpenedPayload, slackAPI, config);
    return await slackAPI.findChannel(channelName, config.usePrivateChannels);
}