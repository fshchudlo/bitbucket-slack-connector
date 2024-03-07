import * as slack from "@slack/web-api";
import { SlackGateway } from "./SlackGateway";

export class SlackWebClientGateway implements SlackGateway {
    client: slack.WebClient;

    constructor(client: slack.WebClient) {
        this.client = client;
    }

    async getChannelId(channelName: string): Promise<string> {
        const someFutureDate = new Date();
        someFutureDate.setDate(someFutureDate.getDate() + 1);

        // We use scheduleMessage instead of conversations.list to avoid requirement of additional (and quite privileged) scopes for the bot
        const result = await this.client.chat.scheduleMessage({
            channel: channelName,
            post_at: Number.parseInt("" + (someFutureDate.getTime() / 1000)),
            text: "Scheduled message to detect channel id. If you see that, something went wrong with a slack bot"
        });

        await this.client.chat.deleteScheduledMessage({
            channel: channelName,
            scheduled_message_id: result.scheduled_message_id
        });

        return result.channel;
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
