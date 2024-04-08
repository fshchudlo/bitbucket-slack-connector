import * as slack from "@slack/web-api";
import { BitbucketCommentSnapshotInSlackMetadata, SlackChannelInfo, UserPayload } from "../typings";
import { SlackGateway } from "../webhook-handler/SlackGateway";
import { InMemoryCache } from "./cache/InMemoryCache";

function getCommentCacheKey(channelId: string, bitbucketCommentId: number | string) {
    return `${channelId}-${bitbucketCommentId}`;
}

export class SlackGatewayCachedDecorator implements SlackGateway {
    private channelsCacheHitsCounter = 0;
    private channelsCacheMissesCounter = 0;
    private bitbucketCommentsCacheHitsCounter = 0;
    private bitbucketCommentsCacheMissesCounter = 0;
    private gateway: SlackGateway;
    public readonly channelsCache: InMemoryCache<SlackChannelInfo>;
    public readonly bitbucketCommentsCache: InMemoryCache<BitbucketCommentSnapshotInSlackMetadata>;

    constructor(gateway: SlackGateway) {
        this.gateway = gateway;
        this.channelsCache = new InMemoryCache(200);
        this.bitbucketCommentsCache = new InMemoryCache(500);
    }

    get channelsCacheHits(): number {
        return this.channelsCacheHitsCounter;
    }

    get channelsCacheMisses(): number {
        return this.channelsCacheMissesCounter;
    }

    get bitbucketCommentsCacheHits(): number {
        return this.bitbucketCommentsCacheHitsCounter;
    }

    get bitbucketCommentsCacheMisses(): number {
        return this.bitbucketCommentsCacheMissesCounter;
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
            this.channelsCacheHitsCounter++;
            return Promise.resolve(cachedChannelInfo);
        }
        this.channelsCacheMissesCounter++;
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

    async findLatestBitbucketCommentSnapshot(channelName: string, bitbucketCommentId: number): Promise<BitbucketCommentSnapshotInSlackMetadata | null> {
        const channelInfo = await this.getChannelInfo(channelName);
        const cacheKey = getCommentCacheKey(channelInfo.id, bitbucketCommentId);
        const cachedCommentInfo = this.bitbucketCommentsCache.get(cacheKey);
        if (cachedCommentInfo) {
            this.bitbucketCommentsCacheHitsCounter++;
            return Promise.resolve(cachedCommentInfo);
        }
        this.bitbucketCommentsCacheMissesCounter++;
        const commentSnapshot = await this.gateway.findLatestBitbucketCommentSnapshot(channelName, bitbucketCommentId);

        if (commentSnapshot) {
            this.bitbucketCommentsCache.set(cacheKey, commentSnapshot);
        }
        return commentSnapshot;
    }
}