import * as slack from "@slack/web-api";
import {
    BitbucketCommentSnapshot,
    BitbucketCommentSnapshotInSlackMetadata,
    CreateChannelArguments,
    InviteToChannelArguments,
    KickFromChannelArguments,
    SendMessageArguments,
    SendMessageResponse,
    AddBookmarkArguments,
    SlackAPIAdapter,
    SlackChannelInfo, PullRequestSnapshotInSlackMetadata
} from "../../webhook-handler/ports/SlackAPIAdapter";
import { UserPayload } from "../../typings";
import { WebhookConfig } from "../../app.config";
import { MessageElement } from "@slack/web-api/dist/response/ConversationsHistoryResponse";
import { SNAPSHOT_COMMENT_STATE_EVENT_TYPE } from "../../webhook-handler/use-cases/helpers";
import {
    SNAPSHOT_PULL_REQUEST_STATE_EVENT_TYPE
} from "../../webhook-handler/use-cases/helpers/snapshotPullRequestState";

const awaitingCreateChannelRequests = new Map<string, Promise<SlackChannelInfo>>();

/**
 * Adapter for the Slack API that also acts as an {@link https://awesome-architecture.com/cloud-design-patterns/anti-corruption-layer-pattern/|anti-corruption layer} since Slack API is not always consistent
 */
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
        const channelTypes = WebhookConfig.USE_PRIVATE_CHANNELS ? "private_channel" : undefined;
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
            } catch (error) {
                reject(error);
            } finally {
                awaitingCreateChannelRequests.delete(options.name);
            }
        });
        awaitingCreateChannelRequests.set(options.name, createChannelPromise);
        return createChannelPromise;
    }

    addBookmark(options: AddBookmarkArguments): Promise<void> {
        return this.client.bookmarks.add({
            channel_id: options.channelId,
            link: options.link,
            title: options.title,
            type: "link"
        }) as unknown as Promise<void>;
    }

    inviteToChannel(options: InviteToChannelArguments): Promise<void> {
        return this.client.conversations.invite({
            channel: options.channelId,
            users: options.users.join(","),
            force: true
        }).catch(error => {
            return error.data.errors.every((innerError: any) => {
                return innerError.error == "already_in_channel";
            }) ? undefined : error;
        }) as unknown as Promise<void>;
    }

    kickFromChannel(options: KickFromChannelArguments): Promise<void> {
        return Promise.all(options.users.map(async userId => {
            return this.client.conversations.kick({
                channel: options.channelId,
                user: userId
            }).catch(error => error.data.error == "not_in_channel" ? undefined : error);
        })) as unknown as Promise<void>;
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
        const matchPredicate = (message: MessageElement) => {
            const eventPayload = message.metadata.event_type === SNAPSHOT_COMMENT_STATE_EVENT_TYPE ? <BitbucketCommentSnapshotInSlackMetadata>message.metadata?.event_payload : null;
            return eventPayload && eventPayload?.commentId === bitbucketCommentId.toString();
        };
        const message = await this.findMessageInChannelHistory(channelId, matchPredicate);

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
    }

    async tryFindPullRequestOpenedBroadcastMessageId(channelId: string, pullRequestTraits: PullRequestSnapshotInSlackMetadata): Promise<string | null> {
        const matchPredicate = (message: MessageElement) => {
            const eventPayload = message.metadata.event_type === SNAPSHOT_PULL_REQUEST_STATE_EVENT_TYPE ? <PullRequestSnapshotInSlackMetadata>message.metadata?.event_payload : null;
            return eventPayload && eventPayload?.pullRequestId === pullRequestTraits.pullRequestId && eventPayload?.projectKey === pullRequestTraits.projectKey && eventPayload?.repositorySlug === pullRequestTraits.repositorySlug;
        };
        const message = await this.findMessageInChannelHistory(channelId, matchPredicate);
        return message?.ts || null;
    }

    private async findMessageInChannelHistory(channelId: string, matchPredicate: (message: MessageElement) => boolean) {
        let cursor: string | undefined = undefined;

        while (true) {
            const response = await this.client.conversations.history({
                channel: channelId,
                include_all_metadata: true,
                cursor
            });

            const
                message = response.messages.find(matchPredicate);

            if (message) {
                return message;
            }

            if (response.response_metadata && response.response_metadata.next_cursor
            ) {
                cursor = response.response_metadata.next_cursor;
            } else {
                return null;
            }
        }
    }
}
