import { BitbucketNotification, PullRequestBasicNotification } from "../bitbucket-payload-types";
import { buildChannelName } from "./buildChannelName";
import { SlackChannelFactory } from "./slack-channel-factory/SlackChannelFactory";
import handleWebhookPayload from "../bitbucket-webhook-handler/handleWebhookPayload";
import { SlackChannel } from "../bitbucket-webhook-handler/SlackChannel";
import { AppConfig } from "../app.config";

export async function provisionPullRequestChannel(channelFactory: SlackChannelFactory, broadcastChannel: SlackChannel | null, payload: BitbucketNotification) {
    const channelName = buildChannelName(payload.pullRequest);
    if (payload.eventKey == "pr:opened") {
        return await channelFactory.setupNewChannel({
            name: channelName,
            isPrivate: AppConfig.USE_PRIVATE_CHANNELS,
            defaultParticipants: AppConfig.DEFAULT_CHANNEL_PARTICIPANTS
        });
    }
    const existingChannel = await channelFactory.fromExistingChannel(channelName, AppConfig.USE_PRIVATE_CHANNELS);
    if (existingChannel != null) {
        return existingChannel;
    }

    const createdChannel = await channelFactory.setupNewChannel({
        name: channelName,
        isPrivate: AppConfig.USE_PRIVATE_CHANNELS,
        defaultParticipants: AppConfig.DEFAULT_CHANNEL_PARTICIPANTS
    });
    const prOpenedPayload = <PullRequestBasicNotification>{
        eventKey: "pr:opened",
        actor: {
            displayName: payload.pullRequest.author.user.displayName,
            emailAddress: payload.pullRequest.author.user.emailAddress
        },
        pullRequest: payload.pullRequest
    };
    await handleWebhookPayload(prOpenedPayload, createdChannel, broadcastChannel);
    return createdChannel;
}