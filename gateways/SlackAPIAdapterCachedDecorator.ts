import * as slack from "@slack/web-api";
import { UserPayload } from "../typings";
import { BitbucketCommentSnapshot, SlackAPIAdapter } from "../webhook-handler/SlackAPIAdapter";
import { InMemoryCache } from "./cache/InMemoryCache";
import { BitbucketCommentSnapshotInSlackMetadata, SlackChannelInfo } from "../webhook-handler/SlackAPIAdapter";

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

    async createChannel(options: slack.ConversationsCreateArguments): Promise<slack.ConversationsCreateResponse> {
        const response = await this.gateway.createChannel(options);
        this.channelsCache.set(options.name, <SlackChannelInfo>{
            id: response.channel.id,
            name: response.channel.name,
            isArchived: response.channel.is_archived
        });
        return response;
    }

    async getChannelInfo(channelName: string, excludeArchived?: boolean): Promise<SlackChannelInfo | null> {
        const cachedChannelInfo = this.channelsCache.get(channelName);
        if (cachedChannelInfo) {
            return Promise.resolve(cachedChannelInfo);
        }
        const channelInfo = await this.gateway.getChannelInfo(channelName, excludeArchived);

        if (channelInfo) {
            this.channelsCache.set(channelName, channelInfo);
        }
        return channelInfo;
    }

    async archiveChannel(channelId: string): Promise<slack.ConversationsArchiveResponse> {
        const response = await this.gateway.archiveChannel(channelId);
        this.channelsCache.deleteWhere((k, v) => v.id == channelId);
        this.bitbucketCommentsCache.deleteWhere((k) => k.startsWith(getCommentCacheKey(channelId, "")));
        return response;
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

    async sendMessage(options: slack.ChatPostMessageArguments): Promise<slack.ChatPostMessageResponse> {
        const response = await this.gateway.sendMessage(options);
        const metadata = <BitbucketCommentSnapshotInSlackMetadata>options.metadata?.event_payload;
        if (metadata?.commentId) {
            const commentSnapshot: BitbucketCommentSnapshot = {
                commentId: metadata.commentId,
                commentParentId: metadata.commentParentId,
                threadResolvedDate: metadata.threadResolvedDate,
                taskResolvedDate: metadata.taskResolvedDate,
                severity: metadata.severity,
                slackMessageId: response.message.ts,
                slackThreadId: response.message.thread_ts
            };
            this.bitbucketCommentsCache.set(getCommentCacheKey(response.channel, commentSnapshot.commentId), commentSnapshot);
        }
        return response;
    }

    async findLatestBitbucketCommentSnapshot(channelName: string, bitbucketCommentId: number | string): Promise<BitbucketCommentSnapshot | null> {
        const channelInfo = await this.getChannelInfo(channelName);
        const cacheKey = getCommentCacheKey(channelInfo.id, bitbucketCommentId);
        const cachedCommentInfo = this.bitbucketCommentsCache.get(cacheKey);
        if (cachedCommentInfo) {
            return Promise.resolve(cachedCommentInfo);
        }
        const commentSnapshot = await this.gateway.findLatestBitbucketCommentSnapshot(channelInfo.id, bitbucketCommentId);

        if (commentSnapshot) {
            this.bitbucketCommentsCache.set(cacheKey, commentSnapshot);
        }
        return commentSnapshot;
    }
}