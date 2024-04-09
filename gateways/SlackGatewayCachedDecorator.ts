import * as slack from "@slack/web-api";
import { BitbucketCommentSnapshotInSlackMetadata, SlackChannelInfo, UserPayload } from "../typings";
import { SlackGateway } from "../webhook-handler/SlackGateway";
import { InMemoryCache } from "./cache/InMemoryCache";

function getCommentCacheKey(channelId: string, bitbucketCommentId: number | string) {
    return `${channelId}-${bitbucketCommentId}`;
}

export class SlackGatewayCachedDecorator implements SlackGateway {
    private gateway: SlackGateway;
    readonly channelsCache: InMemoryCache<SlackChannelInfo>;
    readonly bitbucketCommentsCache: InMemoryCache<BitbucketCommentSnapshotInSlackMetadata>;

    constructor(gateway: SlackGateway) {
        this.gateway = gateway;
        this.channelsCache = new InMemoryCache("channels", 200);
        this.bitbucketCommentsCache = new InMemoryCache("comments", 500);
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

    archiveChannel(channelId: string): Promise<slack.ConversationsArchiveResponse> {
        const promise = this.gateway.archiveChannel(channelId);
        promise.then(() => {
            this.channelsCache.deleteWhere((k, v) => v.id == channelId);
            this.bitbucketCommentsCache.deleteWhere((k) => k.startsWith(getCommentCacheKey(channelId, "")));
        });
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
        const promise = this.gateway.sendMessage(options);

        promise.then((r) => {
            const commentSnapshot = <BitbucketCommentSnapshotInSlackMetadata>options.metadata?.event_payload;
            if (commentSnapshot?.comment_id) {
                this.bitbucketCommentsCache.set(getCommentCacheKey(r.channel, commentSnapshot.comment_id), commentSnapshot);
            }
        });

        return promise;
    }

    async findLatestBitbucketCommentSnapshot(channelName: string, bitbucketCommentId: number | string): Promise<BitbucketCommentSnapshotInSlackMetadata | null> {
        const channelInfo = await this.getChannelInfo(channelName);
        const cacheKey = getCommentCacheKey(channelInfo.id, bitbucketCommentId);
        const cachedCommentInfo = this.bitbucketCommentsCache.get(cacheKey);
        if (cachedCommentInfo) {
            return Promise.resolve(cachedCommentInfo);
        }
        const commentSnapshot = await this.gateway.findLatestBitbucketCommentSnapshot(channelName, bitbucketCommentId);

        if (commentSnapshot) {
            this.bitbucketCommentsCache.set(cacheKey, commentSnapshot);
        }
        return commentSnapshot;
    }
}