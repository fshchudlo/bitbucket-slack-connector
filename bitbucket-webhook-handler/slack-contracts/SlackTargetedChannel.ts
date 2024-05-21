import { CommentSeverity } from "../../bitbucket-payload-types";
import { SlackChannelInfo } from "../../slack-api/SlackChannelProvisioner";
import { SendMessageArguments, SendMessageResponse } from "./SendMessageArguments";

export interface SlackTargetedChannel {
    readonly channelInfo: SlackChannelInfo;
    getSlackUserIds(userEmails: Array<string>): Promise<string[]>;
    addBookmark(options: AddBookmarkArguments): Promise<void>;
    inviteToChannel(options: InviteToChannelArguments): Promise<void>;
    kickFromChannel(options: KickFromChannelArguments): Promise<void>;
    closeChannel(): Promise<void>;
    sendMessage(options: SendMessageArguments): Promise<SendMessageResponse>;
    findLatestBitbucketCommentSnapshot(bitbucketCommentId: number | string): Promise<BitbucketCommentSnapshot | null>;
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
