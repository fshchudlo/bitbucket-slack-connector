import {
    AddBookmarkArguments,
    BitbucketCommentSnapshot,
    BitbucketCommentSnapshotInSlackMetadata,
    InviteToChannelArguments,
    KickFromChannelArguments,
    SlackTargetedChannel
} from "../../bitbucket-webhook-handler/slack-contracts/SlackTargetedChannel";
import { SlackChannelInfo } from "../SlackChannelProvisioner";
import { CHANNELS_CACHE } from "../CHANNELS_CACHE";
import { COMMENTS_CACHE } from "../COMMENTS_CACHE";
import {
    PullRequestSnapshotInSlackMetadata,
    SlackBroadcastChannel
} from "../../bitbucket-webhook-handler/slack-contracts/SlackBroadcastChannel";
import {
    SendMessageArguments,
    SendMessageResponse
} from "../../bitbucket-webhook-handler/slack-contracts/SendMessageArguments";
import { SlackWebClientChannel } from "./SlackWebClientChannel";

function getCommentCacheKey(channelId: string, bitbucketCommentId: number | string) {
    return `${channelId}-${bitbucketCommentId}`;
}


export class SlackChannelCachedDecorator implements SlackTargetedChannel, SlackBroadcastChannel {
    get channelInfo(): SlackChannelInfo {
        return this.channel.channelInfo;
    }

    private channel: SlackWebClientChannel;

    constructor(channel: SlackWebClientChannel) {
        this.channel = channel;
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
                ...metadata,
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

