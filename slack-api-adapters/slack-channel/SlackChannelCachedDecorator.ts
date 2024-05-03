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
} from "../../bitbucket-webhook-handler/SlackChannel";
import { SlackChannelInfo } from "../slack-channel-factory/SlackChannelFactory";
import { CHANNELS_CACHE } from "../cache/CHANNELS_CACHE";
import { COMMENTS_CACHE } from "../cache/COMMENTS_CACHE";

function getCommentCacheKey(channelId: string, bitbucketCommentId: number | string) {
    return `${channelId}-${bitbucketCommentId}`;
}


export class SlackChannelCachedDecorator implements SlackChannel {
    get channelInfo(): SlackChannelInfo {
        return this.channel.channelInfo;
    }
    private channel: SlackChannel;
    constructor(gateway: SlackChannel) {
        this.channel = gateway;
    }


    async closeChannel(): Promise<void> {
        await this.channel.closeChannel();
        CHANNELS_CACHE.deleteWhere((k, v) => v.id == this.channel.channelInfo.id);
        COMMENTS_CACHE.deleteWhere((k) => k.startsWith(getCommentCacheKey(this.channel.channelInfo.id, "")));
    }

    addReaction(messageId: string, reaction: string): Promise<void> {
        return this.channel.addReaction(messageId, reaction);
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
            COMMENTS_CACHE.set(getCommentCacheKey(this.channel.channelInfo.id, commentSnapshot.commentId), commentSnapshot);
        }
        return response;
    }

    async findLatestBitbucketCommentSnapshot(bitbucketCommentId: number | string): Promise<BitbucketCommentSnapshot | null> {
        const cacheKey = getCommentCacheKey(this.channel.channelInfo.id, bitbucketCommentId);
        const cachedCommentInfo = COMMENTS_CACHE.get(cacheKey);
        if (cachedCommentInfo) {
            return Promise.resolve(cachedCommentInfo);
        }
        const commentSnapshot = await this.channel.findLatestBitbucketCommentSnapshot(bitbucketCommentId);

        if (commentSnapshot) {
            COMMENTS_CACHE.set(cacheKey, commentSnapshot);
        }
        return commentSnapshot;
    }

    findPROpenedBroadcastMessageId(prCreationDate: Date, pullRequestTraits: PullRequestSnapshotInSlackMetadata): Promise<string | null> {
        return this.channel.findPROpenedBroadcastMessageId(prCreationDate, pullRequestTraits);
    }
}

