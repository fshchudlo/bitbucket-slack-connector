import * as slack from "@slack/web-api";
import {
    CreateChannelArguments,
    SlackChannelFactory,
    SlackChannelInfo
} from "./SlackChannelFactory";
import { SlackWebClientChannel } from "../slack-channel/SlackWebClientChannel";

const awaitingCreateChannelRequests = new Map<string, Promise<SlackChannelInfo>>();

export class SlackWebClientChannelFactory implements SlackChannelFactory {
    readonly client: slack.WebClient;

    constructor(client: slack.WebClient) {
        this.client = client;
    }

    async setupNewChannel(options: CreateChannelArguments): Promise<SlackWebClientChannel> {
        const channelInfo = await this.createNewChannelInSlack(options);
        const channel = new SlackWebClientChannel(this.client, channelInfo);
        if (options.defaultParticipants?.length > 0) {
            await channel.inviteToChannel({ users: options.defaultParticipants, force: true });
        }
        return channel;
    }

    async fromExistingChannel(channelName: string): Promise<SlackWebClientChannel | null> {
        const channelInfo = await this.findExistingChannelInfo(channelName);
        return channelInfo ? new SlackWebClientChannel(this.client, channelInfo) : null;
    }

    private async findExistingChannelInfo(channelName: string): Promise<SlackChannelInfo | null> {
        const someFutureDate = new Date();
        someFutureDate.setDate(someFutureDate.getDate() + 1);

        // We don't use conversations.list since it can be very slow, prone to request limiting, and it requires additional (and quite privileged) scopes for the bot
        try {
            const result = await this.client.chat.scheduleMessage({
                channel: channelName,
                post_at: Number.parseInt("" + (someFutureDate.getTime() / 1000)),
                text: "Scheduled message to detect channel id. If you see that, something went wrong with a slack bot"
            });

            await this.client.chat.deleteScheduledMessage({
                channel: channelName,
                scheduled_message_id: result.scheduled_message_id
            });
            return {
                id: result.channel,
                name: channelName
            };
        } catch (error: any) {
            if (error.data?.error == "is_archived" || error.data?.error == "channel_not_found") {
                return null;
            }
            throw error;
        }
    }

    private createNewChannelInSlack(options: CreateChannelArguments): Promise<SlackChannelInfo> {
        if (awaitingCreateChannelRequests.has(options.name)) {
            console.log(`Waiting for channel creation for name ${options.name}`);
            return awaitingCreateChannelRequests.get(options.name);
        }
        const createChannelPromise: Promise<SlackChannelInfo> = new Promise(async (resolve, reject) => {
            try {
                const response = await this.client.conversations.create({
                    name: options.name,
                    is_private: options.isPrivate
                });
                resolve({
                    id: response.channel.id,
                    name: response.channel.name
                });
            } catch (error) {
                reject(error);
            } finally {
                awaitingCreateChannelRequests.delete(options.name);
            }
        });
        awaitingCreateChannelRequests.set(options.name, createChannelPromise);
        return createChannelPromise;
    }
}
