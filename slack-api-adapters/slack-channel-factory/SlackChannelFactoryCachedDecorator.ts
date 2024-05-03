import { SlackChannel } from "../../bitbucket-webhook-handler/SlackChannel";
import {
    CreateChannelArguments,
    SlackChannelFactory
} from "./SlackChannelFactory";
import { CHANNELS_CACHE } from "../cache/CHANNELS_CACHE";
import { SlackWebClientChannel } from "../slack-channel/SlackWebClientChannel";
import { SlackChannelCachedDecorator } from "../slack-channel/SlackChannelCachedDecorator";
import { SlackWebClientChannelFactory } from "./SlackWebClientChannelFactory";

export class SlackChannelFactoryCachedDecorator implements SlackChannelFactory {
    private factory: SlackWebClientChannelFactory;

    constructor(factory: SlackWebClientChannelFactory) {
        this.factory = factory;
    }

    async setupNewChannel(options: CreateChannelArguments): Promise<SlackChannel> {
        const channel = await this.factory.setupNewChannel(options);
        CHANNELS_CACHE.set(options.name, channel.channelInfo);
        return new SlackChannelCachedDecorator(channel);
    }

    async fromExistingChannel(channelName: string, findPrivateChannels: boolean): Promise<SlackChannel> {
        const webClientChannel = await this.instantiateWebClientChannel(channelName, findPrivateChannels);
        return new SlackChannelCachedDecorator(webClientChannel);
    }

    private async instantiateWebClientChannel(channelName: string, findPrivateChannels: boolean): Promise<SlackWebClientChannel | null> {
        const cachedChannelInfo = CHANNELS_CACHE.get(channelName);
        if (cachedChannelInfo) {
            return Promise.resolve(new SlackWebClientChannel(this.factory.client, cachedChannelInfo));
        }
        const channel = <SlackWebClientChannel>await this.factory.fromExistingChannel(channelName, findPrivateChannels);

        if (channel && !channel.channelInfo.isArchived) {
            CHANNELS_CACHE.set(channelName, channel.channelInfo);
        }
        return channel;
    }
}