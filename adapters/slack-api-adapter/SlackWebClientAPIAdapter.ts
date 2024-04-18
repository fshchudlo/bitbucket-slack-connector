import * as slack from "@slack/web-api";
import {
    BitbucketCommentSnapshot,
    BitbucketCommentSnapshotInSlackMetadata,
    CreateChannelArguments,
    InviteToChannelArguments,
    KickFromChannelArguments,
    SendMessageArguments,
    SendMessageResponse,
    SetChannelTopicArguments,
    SlackAPIAdapter,
    SlackChannelInfo
} from "../../webhook-handler/ports/SlackAPIAdapter";
import { UserPayload } from "../../typings";
import appConfig from "../../app.config";
import { MessageElement } from "@slack/web-api/dist/response/ConversationsHistoryResponse";

const awaitingCreateChannelRequests = new Map<string, Promise<SlackChannelInfo>>();

export class SlackWebClientAPIAdapter implements SlackAPIAdapter {
    private client: slack.WebClient;

    constructor(client: slack.WebClient) {
        this.client = client;
    }

    async getSlackUserIds(userPayloads: UserPayload[]): Promise<string[]> {
        const emailAddresses = [...new Set(userPayloads.map(payload => payload.emailAddress))];
        const slackUserIds = await Promise.all(emailAddresses
            .map(email => this.client.users.lookupByEmail({ email })
                .catch(e => e.data?.error == "users_not_found" ? undefined : e)));
        return slackUserIds.filter(r => !!r).map(r => r.user.id);
    }

    async findChannel(channelName: string, excludeArchived?: boolean): Promise<SlackChannelInfo | null> {
        if (awaitingCreateChannelRequests.has(channelName)) {
            return awaitingCreateChannelRequests.get(channelName);
        }
        let cursor: string | undefined = undefined;
        const channelTypes = appConfig.USE_PRIVATE_CHANNELS ? "private_channel" : undefined;
        while (true) {
            const response = await this.client.conversations.list({
                exclude_archived: !!excludeArchived,
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
                awaitingCreateChannelRequests.delete(options.name);
            } catch (error) {
                reject(error);
            }
        });
        awaitingCreateChannelRequests.set(options.name, createChannelPromise);
        return createChannelPromise;
    }

    setChannelTopic(options: SetChannelTopicArguments): Promise<void> {
        return this.client.conversations.setTopic({
            channel: options.channelId,
            topic: options.topic
        }) as unknown as Promise<void>;
    }

    inviteToChannel(options: InviteToChannelArguments): Promise<void> {
        return this.client.conversations.invite({
            channel: options.channelId,
            users: options.users.join(","),
            force: true
        }) as unknown as Promise<void>;
    }

    kickFromChannel(options: KickFromChannelArguments): Promise<void> {
        return this.client.conversations.kick({
            channel: options.channelId,
            user: options.user
        }) as unknown as Promise<void>;
    }

    archiveChannel(channelId: string): Promise<void> {
        return this.client.conversations.archive({ channel: channelId }) as unknown as Promise<void>;
    }

    async sendMessage(options: SendMessageArguments): Promise<SendMessageResponse> {
        const response = await this.client.chat.postMessage({
            channel: options.channelId,
            icon_emoji: options.iconEmoji,
            text: options.text,
            metadata: options.metadata ? {
                event_type: options.metadata.eventType,
                event_payload: options.metadata.eventPayload
            } : undefined,
            attachments: options.attachments,
            blocks: options.blocks,
            thread_ts: options.threadId,
            reply_broadcast: options.replyBroadcast
        });
        return {
            messageId: response.message.ts,
            threadId: response.message.thread_ts
        };
    }

    async findLatestBitbucketCommentSnapshot(channelId: string, bitbucketCommentId: number | string): Promise<BitbucketCommentSnapshot | null> {
        let cursor: string | undefined = undefined;
        const matchPredicate = (message: MessageElement) => {
            const eventPayload = <BitbucketCommentSnapshotInSlackMetadata>message.metadata?.event_payload;
            return eventPayload && eventPayload.commentId === bitbucketCommentId.toString();
        };

        while (true) {
            const response = await this.client.conversations.history({
                channel: channelId,
                include_all_metadata: true,
                cursor
            });

            const message = response.messages.find(matchPredicate);
            if (message) {
                const metadata = <BitbucketCommentSnapshotInSlackMetadata>message.metadata?.event_payload;
                return <BitbucketCommentSnapshot>{
                    commentId: metadata.commentId,
                    commentParentId: metadata.commentParentId,
                    threadResolvedDate: metadata.threadResolvedDate,
                    taskResolvedDate: metadata.taskResolvedDate,
                    severity: metadata.severity,
                    slackMessageId: message.ts,
                    slackThreadId: message.thread_ts
                };
            }

            if (response.response_metadata && response.response_metadata.next_cursor) {
                cursor = response.response_metadata.next_cursor;
            } else {
                return null;
            }
        }
    }
}
