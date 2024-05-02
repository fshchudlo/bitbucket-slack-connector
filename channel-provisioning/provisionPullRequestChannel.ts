import { SlackNotificationChannel } from "../bitbucket-webhook-handler/SlackNotificationChannel";
import { BitbucketNotification, PullRequestBasicNotification } from "../bitbucket-payload-types";
import { WebhookHandlerConfig } from "../bitbucket-webhook-handler/webhookHandlerConfig";
import { buildChannelName } from "./buildChannelName";
import handleBitbucketWebhook from "../bitbucket-webhook-handler/handleBitbucketWebhook";
import { SlackChannelFactory } from "./SlackChannelFactory";

export async function provisionPullRequestChannel(channelFactory: SlackChannelFactory, slackAPI: SlackNotificationChannel, payload: BitbucketNotification, config: WebhookHandlerConfig) {
    const channelName = buildChannelName(payload.pullRequest);
    if (payload.eventKey == "pr:opened") {
        return await channelFactory.createChannel({ name: channelName, isPrivate: config.usePrivateChannels });
    }
    const existingChannel = await channelFactory.findChannel(channelName, config.usePrivateChannels);
    if (existingChannel != null) {
        return existingChannel;
    }

    const newChannel = await channelFactory.createChannel({ name: channelName, isPrivate: config.usePrivateChannels });
    const prOpenedPayload = <PullRequestBasicNotification>{
        eventKey: "pr:opened",
        actor: {
            displayName: payload.pullRequest.author.user.displayName,
            emailAddress: payload.pullRequest.author.user.emailAddress
        },
        pullRequest: payload.pullRequest
    };
    await handleBitbucketWebhook(prOpenedPayload, slackAPI, newChannel, config);
    return await channelFactory.findChannel(channelName, config.usePrivateChannels);
}