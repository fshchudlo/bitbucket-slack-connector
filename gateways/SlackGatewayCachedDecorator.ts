import * as slack from "@slack/web-api";
import { SlackChannelInfo, UserPayload } from "../typings";
import { SlackGateway } from "../webhook-handler/SlackGateway";
import { InMemoryCache } from "./cache/InMemoryCache";

export class SlackGatewayCachedDecorator implements SlackGateway {
    private gateway: SlackGateway;
    public channelsCache: InMemoryCache;

    constructor(gateway: SlackGateway) {
        this.gateway = gateway;
        this.channelsCache = new InMemoryCache(200);
    }

    createChannel(options: slack.ConversationsCreateArguments): Promise<slack.ConversationsCreateResponse> {
        const promise = this.gateway.createChannel(options);

        promise.then(({ channel }) =>
            this.channelsCache.set(options.name, <SlackChannelInfo>{
                id: channel.id,
                name: channel.name,
                isArchived: channel.is_archived
            }));

        return promise;
    }

    async getChannelInfo(channelName: string, excludeArchived?: boolean): Promise<SlackChannelInfo | null> {
        const cachedChannelInfo = this.channelsCache.get<SlackChannelInfo>(channelName);
        if (cachedChannelInfo) {
            return Promise.resolve(cachedChannelInfo);
        }
        const channelInfo = await this.gateway.getChannelInfo(channelName, excludeArchived);

        if (channelInfo) {
            this.channelsCache.set(channelName, channelInfo);
        }
        return channelInfo;
    }

    archiveChannel(channelId: string): Promise<slack.ConversationsArchiveResponse> {
        const promise = this.gateway.archiveChannel(channelId);
        promise.then(() => this.channelsCache.deleteWhere<SlackChannelInfo>(v => v.id == channelId));
        return promise;
    }

    getSlackUserIds(userPayloads: UserPayload[]): Promise<string[]> {
        return this.gateway.getSlackUserIds(userPayloads);
    }

    setChannelTopic(options: slack.ConversationsSetTopicArguments): Promise<slack.ConversationsSetTopicResponse> {
        return this.gateway.setChannelTopic(options);
    }

    inviteToChannel(options: slack.ConversationsInviteArguments): Promise<slack.ConversationsInviteResponse> {
        return this.gateway.inviteToChannel(options);
    }

    kickFromChannel(options: slack.ConversationsKickArguments): Promise<slack.ConversationsKickResponse> {
        return this.gateway.kickFromChannel(options);
    }

    sendMessage(options: slack.ChatPostMessageArguments): Promise<slack.ChatPostMessageResponse> {
        return this.gateway.sendMessage(options);
    }
}