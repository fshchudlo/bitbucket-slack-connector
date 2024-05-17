import * as slack from "@slack/web-api";
import {
    BitbucketCommentSnapshot,
    BitbucketCommentSnapshotInSlackMetadata,
    InviteToChannelArguments,
    KickFromChannelArguments,
    SendMessageArguments,
    SendMessageResponse,
    AddBookmarkArguments,
    SlackChannel,
    PullRequestSnapshotInSlackMetadata
} from "../../bitbucket-webhook-handler/SlackChannel";
import { MessageElement } from "@slack/web-api/dist/response/ConversationsHistoryResponse";
import { SNAPSHOT_COMMENT_STATE_EVENT_TYPE } from "../../bitbucket-webhook-handler/use-case-handlers/utils";
import {
    SNAPSHOT_PULL_REQUEST_STATE_EVENT_TYPE
} from "../../bitbucket-webhook-handler/use-case-handlers/utils/snapshotPullRequestState";
import { SlackChannelInfo } from "../slack-channel-factory/SlackChannelFactory";

/**
 * Adapter for the Slack API that also acts as an {@link https://awesome-architecture.com/cloud-design-patterns/anti-corruption-layer-pattern/|anti-corruption layer} since Slack API is not always consistent
 */
export class SlackWebClientChannel implements SlackChannel {
    private readonly client: slack.WebClient;
    private readonly iconEmoji: string;
    readonly channelInfo: SlackChannelInfo;

    constructor(client: slack.WebClient, channelInfo: SlackChannelInfo = null, iconEmoji = ":bitbucket:") {
        this.client = client;
        this.channelInfo = channelInfo;
        this.iconEmoji = iconEmoji;
    }

    async getSlackUserIds(userEmails: string[]): Promise<string[]> {
        const emailAddresses = [...new Set(userEmails)];
        const slackUserIds = await Promise.all(emailAddresses
            .map(email => this.client.users.lookupByEmail({ email })
                .catch(e => e.data?.error == "users_not_found" ? undefined : e)));
        return slackUserIds.filter(r => !!r).map(r => r.user.id);
    }

    addBookmark(options: AddBookmarkArguments): Promise<void> {
        return this.client.bookmarks.add({
            channel_id: this.channelInfo.id,
            link: options.link,
            title: options.title,
            type: "link"
        }) as unknown as Promise<void>;
    }

    inviteToChannel(options: InviteToChannelArguments): Promise<void> {
        return this.client.conversations.invite({
            channel: this.channelInfo.id,
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
                channel: this.channelInfo.id,
                user: userId
            }).catch(error => error.data.error == "not_in_channel" ? undefined : error);
        })) as unknown as Promise<void>;
    }

    closeChannel(): Promise<void> {
        return this.client.conversations.archive({ channel: this.channelInfo.id }) as unknown as Promise<void>;
    }

    addReaction(messageId: string, reaction: string): Promise<void> {
        return this.client.reactions.add({
            channel: this.channelInfo.id,
            timestamp: messageId,
            name: reaction
        }) as unknown as Promise<void>;
    }

    async sendMessage(options: SendMessageArguments): Promise<SendMessageResponse> {
        const response = await this.client.chat.postMessage({
            channel: this.channelInfo.id,
            icon_emoji: this.iconEmoji,
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

    async findLatestBitbucketCommentSnapshot(bitbucketCommentId: number | string): Promise<BitbucketCommentSnapshot | null> {
        const matchPredicate = (message: MessageElement) => {
            const eventPayload = message.metadata.event_type === SNAPSHOT_COMMENT_STATE_EVENT_TYPE ? <BitbucketCommentSnapshotInSlackMetadata>message.metadata?.event_payload : null;
            return eventPayload && eventPayload?.commentId === bitbucketCommentId.toString();
        };
        const message = await this.findMessageInChannelHistory(this.channelInfo.id, matchPredicate);

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

    async findPROpenedBroadcastMessageId(prCreationDate: Date, pullRequestTraits: PullRequestSnapshotInSlackMetadata): Promise<string | null> {
        const matchPredicate = (message: MessageElement) => {
            const eventPayload = message.metadata?.event_type === SNAPSHOT_PULL_REQUEST_STATE_EVENT_TYPE ? <PullRequestSnapshotInSlackMetadata>message.metadata?.event_payload : null;
            return eventPayload && eventPayload?.pullRequestId === pullRequestTraits.pullRequestId && eventPayload?.projectKey === pullRequestTraits.projectKey && eventPayload?.repositorySlug === pullRequestTraits.repositorySlug;
        };
        const message = await this.findMessageInChannelHistory(this.channelInfo.id, matchPredicate, prCreationDate);
        return message?.ts || null;
    }

    private async findMessageInChannelHistory(channelId: string, matchPredicate: (message: MessageElement) => boolean, oldestDate: Date | undefined = undefined) {
        let cursor: string | undefined = undefined;
        const slackTimestamp = oldestDate ? Math.floor(oldestDate.getTime() / 1000) + ".000000" : undefined;

        while (true) {
            const response = await this.client.conversations.history({
                channel: channelId,
                include_all_metadata: true,
                oldest: slackTimestamp,
                inclusive: true,
                cursor
            });

            const message = response.messages.find(matchPredicate);

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
