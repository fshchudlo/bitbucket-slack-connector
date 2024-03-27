import * as slack from "@slack/web-api";
import { SlackChannelInfo, UserPayload } from "../../typings";

export interface SlackGateway {
    getChannelInfo(channelName: string): Promise<SlackChannelInfo | undefined>;

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
}