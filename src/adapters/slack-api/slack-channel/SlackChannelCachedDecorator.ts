import { SlackChannelInfo } from "../SlackChannelProvisioner";
import { CHANNELS_CACHE } from "../CHANNELS_CACHE";
import { COMMENTS_CACHE } from "../COMMENTS_CACHE";
import {
    AddBookmarkArguments, PullRequestCommentSnapshot, PullrequestCommentSnapshotInSlackMetadata,
    InviteToChannelArguments,
    KickFromChannelArguments,
    PullRequestSnapshotInSlackMetadata,
    SendMessageArguments,
    SendMessageResponse, SlackBroadcastChannel, SlackTargetedChannel
} from "../../../use-cases/slack-api-ports";
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
        const metadata = <PullrequestCommentSnapshotInSlackMetadata>options.metadata?.eventPayload;
        if (metadata?.commentId) {
            const commentSnapshot: PullRequestCommentSnapshot = {
                ...metadata,
                slackMessageId: response.messageId,
                slackThreadId: response.threadId
            };
            COMMENTS_CACHE.set(getCommentCacheKey(this.channel.channelInfo.id, commentSnapshot.commentId), commentSnapshot);
        }
        return response;
    }

    async findLatestPullRequestCommentSnapshot(bitbucketCommentId: number | string): Promise<PullRequestCommentSnapshot | null> {
        const cacheKey = getCommentCacheKey(this.channel.channelInfo.id, bitbucketCommentId);
        const cachedCommentInfo = COMMENTS_CACHE.get(cacheKey);
        if (cachedCommentInfo) {
            return Promise.resolve(cachedCommentInfo);
        }
        const commentSnapshot = await this.channel.findLatestPullRequestCommentSnapshot(bitbucketCommentId);

        if (commentSnapshot) {
            COMMENTS_CACHE.set(cacheKey, commentSnapshot);
        }
        return commentSnapshot;
    }

    findPROpenedBroadcastMessageId(prCreationDate: Date, pullRequestTraits: PullRequestSnapshotInSlackMetadata): Promise<string | null> {
        return this.channel.findPROpenedBroadcastMessageId(prCreationDate, pullRequestTraits);
    }
}

