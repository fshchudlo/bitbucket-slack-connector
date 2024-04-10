import * as slack from "@slack/web-api";
import { CommentSeverity, UserPayload } from "../typings";

export interface SlackGateway {
    getChannelInfo(channelName: string, excludeArchived?: boolean): Promise<SlackChannelInfo | null>;

    getSlackUserIds(userPayloads: Array<UserPayload>): Promise<string[]>;

    createChannel(options: slack.ConversationsCreateArguments): Promise<slack.ConversationsCreateResponse>;

    setChannelTopic(options: slack.ConversationsSetTopicArguments): Promise<slack.ConversationsSetTopicResponse>;

    inviteToChannel(options: slack.ConversationsInviteArguments): Promise<slack.ConversationsInviteResponse>;

    kickFromChannel(options: slack.ConversationsKickArguments): Promise<slack.ConversationsKickResponse>;

    /*
    Channel archiving is quite unique in Slack since it requires channel id, not the name. To make it explicit, we change contract here
     */
    archiveChannel(channelId: string): Promise<slack.ConversationsArchiveResponse>;

    sendMessage(options: slack.ChatPostMessageArguments): Promise<slack.ChatPostMessageResponse>;

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
