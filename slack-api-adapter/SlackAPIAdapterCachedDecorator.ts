import {
    BitbucketCommentSnapshot,
    BitbucketCommentSnapshotInSlackMetadata,
    InviteToChannelArguments,
    KickFromChannelArguments, SendMessageArguments, SendMessageResponse,
    AddBookmarkArguments,
    SlackChannel,
    PullRequestSnapshotInSlackMetadata
} from "../bitbucket-webhook-handler/SlackChannel";
import { InMemoryCache } from "./cache/InMemoryCache";
import {
    CreateChannelArguments,
    SlackChannelFactory,
    SlackChannelInfo
} from "../channel-provisioning/SlackChannelFactory";

function getCommentCacheKey(channelId: string, bitbucketCommentId: number | string) {
    return `${channelId}-${bitbucketCommentId}`;
}

export class SlackAPIAdapterCachedDecorator implements SlackChannel, SlackChannelFactory {
    private gateway: SlackChannel;
    private factory: SlackChannelFactory;
    static readonly channelsCache = new InMemoryCache<SlackChannelInfo>("channels");
    static readonly commentsCache = new InMemoryCache<BitbucketCommentSnapshot>("comments");

    constructor(gateway: SlackChannel, factory: SlackChannelFactory) {
        this.gateway = gateway;
        this.factory = factory;
    }

    async createChannel(options: CreateChannelArguments): Promise<SlackChannelInfo> {
        const response = await this.factory.createChannel(options);
        SlackAPIAdapterCachedDecorator.channelsCache.set(options.name, response);
        return response;
    }

    async findChannel(channelName: string, findPrivateChannels: boolean): Promise<SlackChannelInfo | null> {
        const cachedChannelInfo = SlackAPIAdapterCachedDecorator.channelsCache.get(channelName);
        if (cachedChannelInfo) {
            return Promise.resolve(cachedChannelInfo);
        }
        const channelInfo = await this.factory.findChannel(channelName, findPrivateChannels);

        if (channelInfo && !channelInfo.isArchived) {
            SlackAPIAdapterCachedDecorator.channelsCache.set(channelName, channelInfo);
        }
        return channelInfo;
    }

    async closeChannel(channelId: string): Promise<void> {
        await this.gateway.closeChannel(channelId);
        SlackAPIAdapterCachedDecorator.channelsCache.deleteWhere((k, v) => v.id == channelId);
        SlackAPIAdapterCachedDecorator.commentsCache.deleteWhere((k) => k.startsWith(getCommentCacheKey(channelId, "")));
    }

    addReaction(channelId: string, messageId: string, reaction: string): Promise<void> {
        return this.gateway.addReaction(channelId, messageId, reaction);
    }

    getSlackUserIds(userEmails: string[]): Promise<string[]> {
        return this.gateway.getSlackUserIds(userEmails);
    }

    addBookmark(options: AddBookmarkArguments): Promise<void> {
        return this.gateway.addBookmark(options);
    }

    inviteToChannel(options: InviteToChannelArguments): Promise<void> {
        return this.gateway.inviteToChannel(options);
    }

    kickFromChannel(options: KickFromChannelArguments): Promise<void> {
        return this.gateway.kickFromChannel(options);
    }

    async sendMessage(options: SendMessageArguments): Promise<SendMessageResponse> {
        const response = await this.gateway.sendMessage(options);
        const metadata = <BitbucketCommentSnapshotInSlackMetadata>options.metadata?.eventPayload;
        if (metadata?.commentId) {
            const commentSnapshot: BitbucketCommentSnapshot = {
                commentId: metadata.commentId,
                commentParentId: metadata.commentParentId,
                threadResolvedDate: metadata.threadResolvedDate,
                taskResolvedDate: metadata.taskResolvedDate,
                severity: metadata.severity,
                slackMessageId: response.messageId,
                slackThreadId: response.threadId
            };
            SlackAPIAdapterCachedDecorator.commentsCache.set(getCommentCacheKey(options.channelId, commentSnapshot.commentId), commentSnapshot);
        }
        return response;
    }

    async findLatestBitbucketCommentSnapshot(channelId: string, bitbucketCommentId: number | string): Promise<BitbucketCommentSnapshot | null> {
        const cacheKey = getCommentCacheKey(channelId, bitbucketCommentId);
        const cachedCommentInfo = SlackAPIAdapterCachedDecorator.commentsCache.get(cacheKey);
        if (cachedCommentInfo) {
            return Promise.resolve(cachedCommentInfo);
        }
        const commentSnapshot = await this.gateway.findLatestBitbucketCommentSnapshot(channelId, bitbucketCommentId);

        if (commentSnapshot) {
            SlackAPIAdapterCachedDecorator.commentsCache.set(cacheKey, commentSnapshot);
        }
        return commentSnapshot;
    }

    findPROpenedBroadcastMessageId(channelId: string, prCreationDate: Date, pullRequestTraits: PullRequestSnapshotInSlackMetadata): Promise<string | null> {
        return this.gateway.findPROpenedBroadcastMessageId(channelId, prCreationDate, pullRequestTraits);
    }
}