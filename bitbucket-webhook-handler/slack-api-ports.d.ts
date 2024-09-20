import { Block, KnownBlock } from "@slack/bolt";
import { SlackChannelInfo } from "../slack-api-adapters/SlackChannelProvisioner";
import { CommentSeverity } from "../types/normalized-payload-types";

export interface SlackBroadcastChannel {
    addReaction(messageId: string, reaction: string): Promise<void>;

    sendMessage(options: SendMessageArguments): Promise<SendMessageResponse>;

    findPROpenedBroadcastMessageId(prCreationDate: Date, pullRequestTraits: PullRequestSnapshotInSlackMetadata): Promise<string | null>;
}
export interface SlackTargetedChannel {
    readonly channelInfo: SlackChannelInfo;

    getSlackUserIds(userEmails: Array<string>): Promise<string[]>;

    addBookmark(options: AddBookmarkArguments): Promise<void>;

    inviteToChannel(options: InviteToChannelArguments): Promise<void>;

    kickFromChannel(options: KickFromChannelArguments): Promise<void>;

    closeChannel(): Promise<void>;

    sendMessage(options: SendMessageArguments): Promise<SendMessageResponse>;

    findLatestPullRequestCommentSnapshot(commentId: number | string): Promise<PullRequestCommentSnapshot | null>;
}

export type SendMessageResponse = {
    messageId: string;
    threadId?: string;
}

export type SendMessageArguments = {
    text?: string;
    threadId?: string;
    replyBroadcast?: boolean,
    metadata?: {
        eventType: string;
        eventPayload: { [p: string]: string | number | boolean }
    };
    blocks?: Block[] | KnownBlock[]
}

export type PullRequestSnapshotInSlackMetadata = {
    pullRequestId: string,
    projectKey: string,
    repositorySlug: string
}

export type PullrequestCommentSnapshotInSlackMetadata = {
    severity: CommentSeverity;
    taskResolvedDate?: number;
    threadResolvedDate?: number;
    commentId: string;
    commentParentId?: string;
}
export type PullRequestCommentSnapshot = PullrequestCommentSnapshotInSlackMetadata & {
    slackMessageId: string;
    slackThreadId?: string;
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