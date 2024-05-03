import { BitbucketNotification, PullRequestBasicNotification } from "../bitbucket-payload-types";
import { buildChannelName } from "./buildChannelName";
import { SlackChannelFactory } from "./SlackChannelFactory";
import handleBitbucketWebhook from "../bitbucket-webhook-handler/handleBitbucketWebhook";
import { SlackChannel } from "../bitbucket-webhook-handler/SlackChannel";
import { AppConfig } from "../app.config";

export async function provisionNotificationChannel(channelFactory: SlackChannelFactory, broadcastChannel: SlackChannel | null, payload: BitbucketNotification) {
    const channelName = buildChannelName(payload.pullRequest);
    if (payload.eventKey == "pr:opened") {
        return await channelFactory.setupNewChannel({ name: channelName, isPrivate: AppConfig.USE_PRIVATE_CHANNELS });
    }
    const existingChannel = await channelFactory.fromExistingChannel(channelName, AppConfig.USE_PRIVATE_CHANNELS);
    if (existingChannel != null) {
        return existingChannel;
    }

    const createdChannel = await channelFactory.setupNewChannel({
        name: channelName,
        isPrivate: AppConfig.USE_PRIVATE_CHANNELS
    });
    const prOpenedPayload = <PullRequestBasicNotification>{
        eventKey: "pr:opened",
        actor: {
            displayName: payload.pullRequest.author.user.displayName,
            emailAddress: payload.pullRequest.author.user.emailAddress
        },
        pullRequest: payload.pullRequest
    };
    await handleBitbucketWebhook(prOpenedPayload, createdChannel, broadcastChannel, AppConfig.DEFAULT_CHANNEL_PARTICIPANTS);
    return createdChannel;
}