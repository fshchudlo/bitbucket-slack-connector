import * as slack from "@slack/web-api";
import { UserPayload } from "../../typings";

export interface SlackGateway {
    getChannelId(channelName: string): Promise<string>;
    getSlackUserIds(userPayloads: Array<UserPayload>): Promise<string[]>;
    createChannel(options: slack.ConversationsCreateArguments): Promise<slack.ConversationsCreateResponse>;

    setChannelTopic(options: slack.ConversationsSetTopicArguments): Promise<slack.ConversationsSetTopicResponse>;

    inviteToChannel(options: slack.ConversationsInviteArguments): Promise<slack.ConversationsInviteResponse>;

    kickFromChannel(options: slack.ConversationsKickArguments): Promise<slack.ConversationsKickResponse>;

    archiveChannel(options: slack.ConversationsArchiveArguments): Promise<slack.ConversationsArchiveResponse>;

    sendMessage(options: slack.ChatPostMessageArguments): Promise<slack.ChatPostMessageResponse>;
}