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

    findLatestBitbucketCommentSnapshot(channelId: string, bitbucketCommentId: number| string): Promise<BitbucketCommentSnapshotInSlackMetadata | null>;
}
export type BitbucketCommentSnapshotInSlackMetadata = {
    // see https://api.slack.com/reference/metadata for the reference about naming
    comment_id: string,
    severity: CommentSeverity,
    thread_resolved: boolean
}

export type SlackChannelInfo = {
    id?: string;
    isArchived?: boolean;
    name?: string;
}
