import { BitbucketNotification, PullRequestBasicNotification } from "../bitbucket-payload-types";
import { WebhookHandlerConfig } from "../bitbucket-webhook-handler/webhookHandlerConfig";
import { buildChannelName } from "./buildChannelName";
import { SlackChannelFactory } from "./SlackChannelFactory";
import handleBitbucketWebhook from "../bitbucket-webhook-handler/handleBitbucketWebhook";

export async function provisionNotificationChannel(channelFactory: SlackChannelFactory, payload: BitbucketNotification, config: WebhookHandlerConfig) {
    const channelName = buildChannelName(payload.pullRequest);
    if (payload.eventKey == "pr:opened") {
        return await channelFactory.setupNewChannel({ name: channelName, isPrivate: config.usePrivateChannels });
    }
    const existingChannel = await channelFactory.fromExistingChannel(channelName, config.usePrivateChannels);
    if (existingChannel != null) {
        return existingChannel;
    }

    const createdChannel =  await channelFactory.setupNewChannel({ name: channelName, isPrivate: config.usePrivateChannels });
    const prOpenedPayload = <PullRequestBasicNotification>{
         eventKey: "pr:opened",
         actor: {
             displayName: payload.pullRequest.author.user.displayName,
             emailAddress: payload.pullRequest.author.user.emailAddress
         },
         pullRequest: payload.pullRequest
     };
    await handleBitbucketWebhook(prOpenedPayload, createdChannel, config);
    return createdChannel;
}