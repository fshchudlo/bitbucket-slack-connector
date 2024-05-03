import { SlackChannel } from "../bitbucket-webhook-handler/SlackChannel";
import {
    CreateChannelArguments,
    SlackChannelFactory,
    SlackChannelInfo
} from "../channel-provisioning/SlackChannelFactory";
import SlackChannelSnapshottingMock from "./SlackChannelSnapshottingMock";

const channelId = "12345";
export default class SlackChannelFactorySnapshottingMock implements SlackChannelFactory {
    snapshot: {
        createdChannels: SlackChannelInfo[];
        searchedChannels: any[];
    };

    constructor() {
        this.snapshot = {
            createdChannels: new Array<SlackChannelInfo>(),
            searchedChannels: new Array<any>()
        };
    }

    fromExistingChannel(channelName: string, includePrivateChannels: boolean): Promise<SlackChannel | null> {
        this.snapshot.searchedChannels.push({ channelName, includePrivateChannels });
        const channelInfo = this.snapshot.createdChannels.find(c => c.name == channelName);
        return Promise.resolve(channelInfo ? new SlackChannelSnapshottingMock() : null);
    }

    setupNewChannel(options: CreateChannelArguments): Promise<SlackChannel> {
        const channelInfo = <SlackChannelInfo>{ id: channelId, name: options.name, isArchived: false };
        this.snapshot.createdChannels.push(channelInfo);
        return Promise.resolve(new SlackChannelSnapshottingMock());
    }
}
