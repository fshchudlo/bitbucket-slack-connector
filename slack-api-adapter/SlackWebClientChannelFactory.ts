import * as slack from "@slack/web-api";
import {
    CreateChannelArguments,
    SlackChannelFactory,
    SlackChannelInfo
} from "../channel-provisioning/SlackChannelFactory";

const awaitingCreateChannelRequests = new Map<string, Promise<SlackChannelInfo>>();

export class SlackWebClientChannelFactory implements SlackChannelFactory {
    private client: slack.WebClient;

    constructor(client: slack.WebClient) {
        this.client = client;
    }

    async findChannel(channelName: string, findPrivateChannels: boolean): Promise<SlackChannelInfo | null> {
        if (awaitingCreateChannelRequests.has(channelName)) {
            return awaitingCreateChannelRequests.get(channelName);
        }
        let cursor: string | undefined = undefined;
        const channelTypes = findPrivateChannels ? "private_channel" : undefined;
        while (true) {
            const response = await this.client.conversations.list({
                exclude_archived: false,
                types: channelTypes,
                cursor
            });

            const channel = response.channels.find(channel => channel.name === channelName);
            if (channel) {
                return { id: channel.id, isArchived: channel.is_archived, name: channel.name };
            }

            if (response.response_metadata && response.response_metadata.next_cursor) {
                cursor = response.response_metadata.next_cursor;
            } else {
                return null;
            }
        }
    }

    createChannel(options: CreateChannelArguments): Promise<SlackChannelInfo> {
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
                    isArchived: response.channel.is_archived,
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