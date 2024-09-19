import * as slack from "@slack/web-api";
import { SlackWebClientChannel } from "./slack-channel/SlackWebClientChannel";
import { PullRequestNotification } from "../types/normalized-payload-types";
import { buildChannelName } from "./buildChannelName";
import { CHANNELS_CACHE } from "./CHANNELS_CACHE";
import { SlackChannelCachedDecorator } from "./slack-channel/SlackChannelCachedDecorator";

import { SlackBroadcastChannel, SlackTargetedChannel } from "../types/slack-contracts";

const awaitingCreateChannelRequests = new Map<string, Promise<SlackChannelInfo>>();

export class SlackChannelProvisioner {
    private readonly client: slack.WebClient;

    constructor(client: slack.WebClient) {
        this.client = client;
    }

    async provisionChannelFor(payload: PullRequestNotification, usePrivateChannels: boolean, defaultChannelParticipants: string[]): Promise<ProvisionResult> {
        const channelName = buildChannelName(payload.pullRequest);
        if (payload.eventKey == "pr:opened") {
            const newChannel = await this.createNewChannel({
                name: channelName,
                isPrivate: usePrivateChannels,
                defaultParticipants: defaultChannelParticipants
            });
            return {
                channel: newChannel,
                isSetUpProperly: true
            };
        }
        const existingChannel = await this.fromExistingChannel(channelName);
        if (existingChannel != null) {
            return {
                channel: existingChannel,
                isSetUpProperly: true
            };

        }

        const createdChannel = await this.createNewChannel({
            name: channelName,
            isPrivate: usePrivateChannels,
            defaultParticipants: defaultChannelParticipants
        });
        return { channel: createdChannel, isSetUpProperly: false };
    }

    async getBroadcastChannel(channelName: string): Promise<SlackBroadcastChannel | null> {
        return this.fromExistingChannel(channelName);
    }

    async getChannelInfo(channelName: string): Promise<SlackChannelInfo | null> {
        if (awaitingCreateChannelRequests.has(channelName)) {
            return awaitingCreateChannelRequests.get(channelName);
        }

        const cachedChannelInfo = CHANNELS_CACHE.get(channelName);
        if (cachedChannelInfo) {
            return Promise.resolve(cachedChannelInfo);
        }
        const channelInfo = await this.findChannelInSlack(channelName);

        if (!channelInfo) {
            return null;
        }
        CHANNELS_CACHE.set(channelName, channelInfo);
        return channelInfo;
    }

    private async fromExistingChannel(channelName: string): Promise<SlackChannelCachedDecorator | null> {
        const channelInfo = await this.getChannelInfo(channelName);
        return channelInfo ? new SlackChannelCachedDecorator(new SlackWebClientChannel(this.client, channelInfo)) : null;
    }

    private async createNewChannel(options: CreateChannelArguments): Promise<SlackTargetedChannel> {
        const channelInfo = await this.createNewChannelInSlack(options);
        const channel = new SlackWebClientChannel(this.client, channelInfo);
        if (options.defaultParticipants?.length > 0) {
            await channel.inviteToChannel({ users: options.defaultParticipants, force: true });
        }
        CHANNELS_CACHE.set(options.name, channel.channelInfo);
        return new SlackChannelCachedDecorator(channel);
    }

    private async findChannelInSlack(channelName: string): Promise<SlackChannelInfo | null> {
        const someFutureDate = new Date();
        someFutureDate.setDate(someFutureDate.getDate() + 1);

        // We don't use conversations.list since it can be very slow, prone to request limiting, and it requires additional (and quite privileged) scopes for the bot
        try {
            const result = await this.client.chat.scheduleMessage({
                channel: channelName,
                post_at: Number.parseInt("" + (someFutureDate.getTime() / 1000)),
                text: "Scheduled message to detect channel id. If you see that, something went wrong with a slack bot"
            });

            await this.client.chat.deleteScheduledMessage({
                channel: channelName,
                scheduled_message_id: result.scheduled_message_id
            });
            return {
                id: result.channel,
                name: channelName
            };
        } catch (error: any) {
            if (error.data?.error == "is_archived" || error.data?.error == "channel_not_found") {
                return null;
            }
            throw error;
        }
    }

    private createNewChannelInSlack(options: CreateChannelArguments): Promise<SlackChannelInfo> {
        if (awaitingCreateChannelRequests.has(options.name)) {
            console.log(`Waiting for channel creation for name ${options.name}`);
            return awaitingCreateChannelRequests.get(options.name);
        }
        const createChannelPromise: Promise<SlackChannelInfo> = new Promise(async (resolve, reject) => {
            try {
                const response = await this.client.conversations.create({
                    name: options.name,
                    is_private: options.isPrivate
                });
                resolve({
                    id: response.channel.id,
                    name: response.channel.name
                });
            } catch (error) {
                reject(error);
            } finally {
                awaitingCreateChannelRequests.delete(options.name);
            }
        });
        awaitingCreateChannelRequests.set(options.name, createChannelPromise);
        return createChannelPromise;
    }
}

export type ProvisionResult = {
    channel: SlackTargetedChannel,
    isSetUpProperly: boolean
}
export type SlackChannelInfo = {
    id: string;
    name: string;
}
export type CreateChannelArguments = {
    name: string;
    isPrivate: boolean;
    defaultParticipants: string[];
}