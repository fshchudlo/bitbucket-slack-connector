import {
    CreateChannelArguments,
    SlackChannelFactory,
    SlackChannelInfo
} from "../channel-provisioning/SlackChannelFactory";
import { CHANNELS_CACHE } from "./CHANNELS_CACHE";

export class SlackChannelFactoryCachedDecorator implements SlackChannelFactory {
    private factory: SlackChannelFactory;

    constructor(factory: SlackChannelFactory) {
        this.factory = factory;
    }

    async createChannel(options: CreateChannelArguments): Promise<SlackChannelInfo> {
        const response = await this.factory.createChannel(options);
        CHANNELS_CACHE.set(options.name, response);
        return response;
    }

    async findExistingChannel(channelName: string, findPrivateChannels: boolean): Promise<SlackChannelInfo | null> {
        const cachedChannelInfo = CHANNELS_CACHE.get(channelName);
        if (cachedChannelInfo) {
            return Promise.resolve(cachedChannelInfo);
        }
        const channelInfo = await this.factory.findExistingChannel(channelName, findPrivateChannels);

        if (channelInfo && !channelInfo.isArchived) {
            CHANNELS_CACHE.set(channelName, channelInfo);
        }
        return channelInfo;
    }
}