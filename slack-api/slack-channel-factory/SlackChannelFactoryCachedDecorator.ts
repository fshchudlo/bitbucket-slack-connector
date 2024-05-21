import {
    CreateChannelArguments,
    SlackChannelFactory
} from "./SlackChannelFactory";
import { CHANNELS_CACHE } from "../CHANNELS_CACHE";
import { SlackWebClientChannel } from "../slack-channel/SlackWebClientChannel";
import { SlackChannelCachedDecorator } from "../slack-channel/SlackChannelCachedDecorator";
import { SlackWebClientChannelFactory } from "./SlackWebClientChannelFactory";

export class SlackChannelFactoryCachedDecorator implements SlackChannelFactory {
    private factory: SlackWebClientChannelFactory;

    constructor(factory: SlackWebClientChannelFactory) {
        this.factory = factory;
    }

    async setupNewChannel(options: CreateChannelArguments): Promise<SlackChannelCachedDecorator> {
        const channel = await this.factory.setupNewChannel(options);
        CHANNELS_CACHE.set(options.name, channel.channelInfo);
        return new SlackChannelCachedDecorator(channel);
    }

    async fromExistingChannel(channelName: string): Promise<SlackChannelCachedDecorator | null> {
        const webClientChannel = await this.initWebClientChannel(channelName);
        return webClientChannel ? new SlackChannelCachedDecorator(webClientChannel) : null;
    }

    private async initWebClientChannel(channelName: string): Promise<SlackWebClientChannel | null> {
        const cachedChannelInfo = CHANNELS_CACHE.get(channelName);
        if (cachedChannelInfo) {
            return Promise.resolve(new SlackWebClientChannel(this.factory.client, cachedChannelInfo));
        }
        const channel = await this.factory.fromExistingChannel(channelName);

        if (channel) {
            CHANNELS_CACHE.set(channelName, channel.channelInfo);
        }
        return channel;
    }
}