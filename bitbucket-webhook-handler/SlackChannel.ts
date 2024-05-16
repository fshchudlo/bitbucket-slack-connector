import { CommentSeverity } from "../bitbucket-payload-types";
import { Block, KnownBlock } from "@slack/bolt";
import { SlackChannelInfo } from "../slack-api-adapters/slack-channel-factory/SlackChannelFactory";

export interface SlackChannel {
    readonly channelInfo: SlackChannelInfo;
    getSlackUserIds(userEmails: Array<string>): Promise<string[]>;
    addBookmark(options: AddBookmarkArguments): Promise<void>;
    inviteToChannel(options: InviteToChannelArguments): Promise<void>;
    kickFromChannel(options: KickFromChannelArguments): Promise<void>;
    closeChannel(): Promise<void>;
    addReaction(messageId: string, reaction: string): Promise<void>
    sendMessage(options: SendMessageArguments): Promise<SendMessageResponse>;
    findLatestBitbucketCommentSnapshot(bitbucketCommentId: number | string): Promise<BitbucketCommentSnapshot | null>;
    findPROpenedBroadcastMessageId(prCreationDate: Date, pullRequestTraits: PullRequestSnapshotInSlackMetadata): Promise<string | null>;
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

export type AddBookmarkArguments = {
    link: string;
    title: string;
    emoji?: string;
}

export type InviteToChannelArguments = {
    force: boolean;
    users: string[];
}
export type KickFromChannelArguments = {
    users: string[];
}
export type SendMessageArguments = {
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