import { UserPayload } from "../../typings";
import {
    BitbucketCommentSnapshot,
    BitbucketCommentSnapshotInSlackMetadata,
    CreateChannelArguments,
    InviteToChannelArguments,
    KickFromChannelArguments, SendMessageArguments, SendMessageResponse,
    AddBookmarkArguments,
    SlackAPIAdapter,
    SlackChannelInfo, PullRequestSnapshotInSlackMetadata
} from "../../webhook-handler/ports/SlackAPIAdapter";
import { InMemoryCache } from "./cache/InMemoryCache";

function getCommentCacheKey(channelId: string, bitbucketCommentId: number | string) {
    return `${channelId}-${bitbucketCommentId}`;
}

export class SlackAPIAdapterCachedDecorator implements SlackAPIAdapter {
    private gateway: SlackAPIAdapter;
    readonly channelsCache: InMemoryCache<SlackChannelInfo>;
    readonly bitbucketCommentsCache: InMemoryCache<BitbucketCommentSnapshot>;

    constructor(gateway: SlackAPIAdapter) {
        this.gateway = gateway;
        this.channelsCache = new InMemoryCache("channels", 200);
        this.bitbucketCommentsCache = new InMemoryCache("comments", 500);
    }

    async createChannel(options: CreateChannelArguments): Promise<SlackChannelInfo> {
        const response = await this.gateway.createChannel(options);
        this.channelsCache.set(options.name, response);
        return response;
    }

    async findChannel(channelName: string, excludeArchived?: boolean): Promise<SlackChannelInfo | null> {
        const cachedChannelInfo = this.channelsCache.get(channelName);
        if (cachedChannelInfo) {
            return Promise.resolve(cachedChannelInfo);
        }
        const channelInfo = await this.gateway.findChannel(channelName, excludeArchived);

        if (channelInfo && !channelInfo.isArchived) {
            this.channelsCache.set(channelName, channelInfo);
        }
        return channelInfo;
    }

    async archiveChannel(channelId: string): Promise<void> {
        await this.gateway.archiveChannel(channelId);
        this.channelsCache.deleteWhere((k, v) => v.id == channelId);
        this.bitbucketCommentsCache.deleteWhere((k) => k.startsWith(getCommentCacheKey(channelId, "")));
    }

    addReaction(channelId: string, messageId: string, reaction: string): Promise<void> {
        return this.gateway.addReaction(channelId, messageId, reaction);
    }

    getSlackUserIds(userPayloads: UserPayload[]): Promise<string[]> {
        return this.gateway.getSlackUserIds(userPayloads);
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
            this.bitbucketCommentsCache.set(getCommentCacheKey(options.channelId, commentSnapshot.commentId), commentSnapshot);
        }
        return response;
    }

    async findLatestBitbucketCommentSnapshot(channelId: string, bitbucketCommentId: number | string): Promise<BitbucketCommentSnapshot | null> {
        const cacheKey = getCommentCacheKey(channelId, bitbucketCommentId);
        const cachedCommentInfo = this.bitbucketCommentsCache.get(cacheKey);
        if (cachedCommentInfo) {
            return Promise.resolve(cachedCommentInfo);
        }
        const commentSnapshot = await this.gateway.findLatestBitbucketCommentSnapshot(channelId, bitbucketCommentId);

        if (commentSnapshot) {
            this.bitbucketCommentsCache.set(cacheKey, commentSnapshot);
        }
        return commentSnapshot;
    }

    findPROpenedBroadcastMessageId(channelId: string, pullRequestTraits: PullRequestSnapshotInSlackMetadata): Promise<string | null> {
        return this.gateway.findPROpenedBroadcastMessageId(channelId, pullRequestTraits);
    }
}