import * as slack from "@slack/web-api";
import {
    BitbucketCommentSnapshot,
    BitbucketCommentSnapshotInSlackMetadata,
    SlackChannelInfo,
    SlackAPIAdapter
} from "../webhook-handler/SlackAPIAdapter";
import { UserPayload } from "../typings";
import appConfig from "../app.config";
import { MessageElement } from "@slack/web-api/dist/response/ConversationsHistoryResponse";

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

    async getChannelInfo(channelName: string, excludeArchived?: boolean): Promise<SlackChannelInfo | null> {
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