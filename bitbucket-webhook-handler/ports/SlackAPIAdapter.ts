import { CommentSeverity } from "../../bitbucket-payload-types";
import { Block, KnownBlock } from "@slack/bolt";

export interface SlackAPIAdapter {
    findChannel(channelName: string, findPrivateChannels: boolean): Promise<SlackChannelInfo | null>;

    getSlackUserIds(userEmails: Array<string>): Promise<string[]>;

    createChannel(options: CreateChannelArguments): Promise<SlackChannelInfo>;

    addBookmark(options: AddBookmarkArguments): Promise<void>;

    inviteToChannel(options: InviteToChannelArguments): Promise<void>;

    kickFromChannel(options: KickFromChannelArguments): Promise<void>;

    archiveChannel(channelId: string): Promise<void>;
    addReaction(channelId: string, messageId: string, reaction: string): Promise<void>
    sendMessage(options: SendMessageArguments): Promise<SendMessageResponse>;
    findLatestBitbucketCommentSnapshot(channelId: string, bitbucketCommentId: number | string): Promise<BitbucketCommentSnapshot | null>;
    findPROpenedBroadcastMessageId(channelId: string, prCreationDate: Date, pullRequestTraits: PullRequestSnapshotInSlackMetadata): Promise<string | null>;
}

export type BitbucketCommentSnapshotInSlackMetadata = {
    severity: CommentSeverity;
    taskResolvedDate?: number;
    threadResolvedDate?: number;
    commentId: string;
    commentParentId?: string;
}
export type BitbucketCommentSnapshot = BitbucketCommentSnapshotInSlackMetadata & {
    slackMessageId: string;
    slackThreadId?: string;
}
export type PullRequestSnapshotInSlackMetadata = {
    pullRequestId: string,
    projectKey: string,
    repositorySlug: string
}

export type SlackChannelInfo = {
    id: string;
    name: string;
    isArchived: boolean;
}
export type CreateChannelArguments = {
    name: string;
    isPrivate?: boolean;
}
export type AddBookmarkArguments = {
    channelId: string;
    link: string;
    title: string;
    emoji?: string;
}

export type InviteToChannelArguments = {
    channelId: string;
    force: boolean;
    users: string[];
}
export type KickFromChannelArguments = {
    channelId: string;
    users: string[];
}
export type SendMessageArguments = {
    channelId: string;
    iconEmoji?: string;
    text?: string;
    threadId?: string;
    replyBroadcast?: boolean,
    attachments?: Array<{
        text: string,
        color?: string
    }>;
    metadata?: {
        eventType: string;
        eventPayload: { [p: string]: string | number | boolean }
    };
    blocks?: Block[] | KnownBlock[]
}
export type SendMessageResponse = {
    messageId: string;
    threadId?: string;
}