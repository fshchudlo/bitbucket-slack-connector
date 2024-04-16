import { CommentSeverity, UserPayload } from "../typings";
import { Block, KnownBlock } from "@slack/bolt";

export interface SlackAPIAdapter {
    findChannel(channelName: string, excludeArchived?: boolean): Promise<SlackChannelInfo | null>;

    getSlackUserIds(userPayloads: Array<UserPayload>): Promise<string[]>;

    provisionChannel(options: CreateChannelArguments): Promise<SlackChannelInfo>;

    createChannel(options: CreateChannelArguments): Promise<SlackChannelInfo>;

    setChannelTopic(options: SetChannelTopicArguments): Promise<void>;

    inviteToChannel(options: InviteToChannelArguments): Promise<void>;

    kickFromChannel(options: KickFromChannelArguments): Promise<void>;

    /*
    Channel archiving is quite unique in Slack since it requires channel id, not the name. To make it explicit, we change contract here
     */
    archiveChannel(channelId: string): Promise<void>;

    sendMessage(options: SendMessageArguments): Promise<SendMessageResponse>;

    findLatestBitbucketCommentSnapshot(channelId: string, bitbucketCommentId: number | string): Promise<BitbucketCommentSnapshot | null>;
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

export type SlackChannelInfo = {
    id?: string;
    isArchived?: boolean;
    name?: string;
}
export type CreateChannelArguments = {
    name: string;
    isPrivate?: boolean;
}
export type SetChannelTopicArguments = {
    channelId: string;
    topic: string;
}

export type InviteToChannelArguments = {
    channelId: string;
    force: boolean;
    users: string[];
}
export type KickFromChannelArguments = {
    channelId: string;
    user: string;
}
export type SendMessageArguments = {
    channel: string;
    iconEmoji?: string;
    text?: string;
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
    channelId: string;
    messageId: string;
    threadId?: string;
}