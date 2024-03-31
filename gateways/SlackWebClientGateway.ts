import * as slack from "@slack/web-api";
import { SlackGateway } from "../webhook-handler/SlackGateway";
import { SlackChannelInfo, UserPayload } from "../typings";
import appConfig from "../app.config";

export class SlackWebClientGateway implements SlackGateway {
    private client: slack.WebClient;

    constructor(client: slack.WebClient) {
        this.client = client;
    }

    async getSlackUserIds(userPayloads: UserPayload[]): Promise<string[]> {
        const slackUserRequests = userPayloads
            .map(r => r.emailAddress)
            .map(async email =>
                await this.client.users.lookupByEmail({
                    email: email
                })
            );
        return [...new Set((await Promise.all(slackUserRequests)).map(r => r.user.id))];
    }

    async getChannelInfo(channelName: string, excludeArchived?: boolean): Promise<SlackChannelInfo | null> {
        let cursor: string | undefined = undefined;
        while (true) {
            const response = await this.client.conversations.list({
                exclude_archived: !!excludeArchived,
                types: appConfig.USE_PRIVATE_CHANNELS ? "private_channel" : undefined,
                cursor
            });

            const channel = response.channels.find(channel => channel.name === channelName);
            if (channel) {
                return { name: channel.name, id: channel.id, isArchived: channel.is_archived };
            }

            if (response.response_metadata && response.response_metadata.next_cursor) {
                cursor = response.response_metadata.next_cursor;
            } else {
                return null;
            }
        }
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

    archiveChannel(channelId: string): Promise<slack.ConversationsArchiveResponse> {
        return this.client.conversations.archive({ channel: channelId });
    }

    sendMessage(options: slack.ChatPostMessageArguments): Promise<slack.ChatPostMessageResponse> {
        return this.client.chat.postMessage(options);
    }
}
