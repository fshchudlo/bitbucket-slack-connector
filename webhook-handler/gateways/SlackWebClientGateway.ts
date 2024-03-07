import * as slack from "@slack/web-api";

import { SlackGateway } from "./SlackGateway";

export class SlackWebClientGateway implements SlackGateway {
    client: slack.WebClient;
    constructor(client: slack.WebClient) {
        this.client = client;
    }
    lookupUserByEmail(options: slack.UsersLookupByEmailArguments): Promise<slack.UsersLookupByEmailResponse> {
        return this.client.users.lookupByEmail(options);
    }
    createChannel(options: slack.ConversationsCreateArguments): Promise<slack.ConversationsCreateResponse> {
        return this.client.conversations.create(options);
    }
    setChannelTopic(options: slack.ConversationsSetTopicArguments): Promise<slack.ConversationsSetTopicResponse> {
        return this.client.conversations.setTopic(options);
    }
    inviteToChannel(options: slack.ConversationsInviteArguments): Promise<slack.ConversationsInviteResponse> {
        return this.client.conversations.invite(options);
    }
    kickFromChannel(options: slack.ConversationsKickArguments): Promise<slack.ConversationsKickResponse> {
        return this.client.conversations.kick(options);
    }
    archiveChannel(options: slack.ConversationsArchiveArguments): Promise<slack.ConversationsArchiveResponse> {
        return this.client.conversations.archive(options);
    }
    sendMessage(options: slack.ChatPostMessageArguments): Promise<slack.ChatPostMessageResponse> {
        return this.client.chat.postMessage(options);
    }
}
