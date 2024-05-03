import {
    AddBookmarkArguments,
    BitbucketCommentSnapshot,
    BitbucketCommentSnapshotInSlackMetadata,
    InviteToChannelArguments,
    KickFromChannelArguments,
    PullRequestSnapshotInSlackMetadata,
    SendMessageArguments,
    SendMessageResponse,
    SlackChannel
} from "../bitbucket-webhook-handler/SlackChannel";
import { CHANNELS_CACHE } from "./CHANNELS_CACHE";
import { COMMENTS_CACHE } from "./COMMENTS_CACHE";

function getCommentCacheKey(channelId: string, bitbucketCommentId: number | string) {
    return `${channelId}-${bitbucketCommentId}`;
}


export class SlackChannelCachedDecorator implements SlackChannel {
    private channel: SlackChannel;

    constructor(gateway: SlackChannel) {
        this.channel = gateway;
    }

    async closeChannel(channelId: string): Promise<void> {
        await this.channel.closeChannel(channelId);
        CHANNELS_CACHE.deleteWhere((k, v) => v.id == channelId);
        COMMENTS_CACHE.deleteWhere((k) => k.startsWith(getCommentCacheKey(channelId, "")));
    }

    addReaction(channelId: string, messageId: string, reaction: string): Promise<void> {
        return this.channel.addReaction(channelId, messageId, reaction);
    }

    getSlackUserIds(userEmails: string[]): Promise<string[]> {
        return this.channel.getSlackUserIds(userEmails);
    }

    addBookmark(options: AddBookmarkArguments): Promise<void> {
        return this.channel.addBookmark(options);
    }

    inviteToChannel(options: InviteToChannelArguments): Promise<void> {
        return this.channel.inviteToChannel(options);
    }

    kickFromChannel(options: KickFromChannelArguments): Promise<void> {
        return this.channel.kickFromChannel(options);
    }

    async sendMessage(options: SendMessageArguments): Promise<SendMessageResponse> {
        const response = await this.channel.sendMessage(options);
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
            COMMENTS_CACHE.set(getCommentCacheKey(options.channelId, commentSnapshot.commentId), commentSnapshot);
        }
        return response;
    }

    async findLatestBitbucketCommentSnapshot(channelId: string, bitbucketCommentId: number | string): Promise<BitbucketCommentSnapshot | null> {
        const cacheKey = getCommentCacheKey(channelId, bitbucketCommentId);
        const cachedCommentInfo = COMMENTS_CACHE.get(cacheKey);
        if (cachedCommentInfo) {
            return Promise.resolve(cachedCommentInfo);
        }
        const commentSnapshot = await this.channel.findLatestBitbucketCommentSnapshot(channelId, bitbucketCommentId);

        if (commentSnapshot) {
            COMMENTS_CACHE.set(cacheKey, commentSnapshot);
        }
        return commentSnapshot;
    }

    findPROpenedBroadcastMessageId(channelId: string, prCreationDate: Date, pullRequestTraits: PullRequestSnapshotInSlackMetadata): Promise<string | null> {
        return this.channel.findPROpenedBroadcastMessageId(channelId, prCreationDate, pullRequestTraits);
    }
}

