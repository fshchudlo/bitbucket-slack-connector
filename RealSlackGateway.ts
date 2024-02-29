import * as slack from "@slack/web-api";

export class RealSlackGateway implements SlackGateway {
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
    closeChannel(options: slack.ConversationsCloseArguments): Promise<slack.ConversationsCloseResponse> {
        return this.client.conversations.close(options);
    }
    sendMessage(options: slack.ChatPostMessageArguments): Promise<slack.ChatPostMessageResponse> {
        return this.client.chat.postMessage(options);
    }
}
