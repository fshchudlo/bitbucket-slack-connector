import * as slack from "@slack/web-api";

import {
    SlackAPIAdapter,
    SlackChannelInfo,
    BitbucketCommentSnapshot,
    CreateChannelArguments,
    SetChannelTopicArguments,
    InviteToChannelArguments,
    KickFromChannelArguments, SendMessageArguments, SendMessageResponse, BitbucketCommentSnapshotInSlackMetadata
} from "../../SlackAPIAdapter";
import { UserPayload } from "../../../typings";

const channelId = "12345";
const messageId = "ABCDE";
export default class SlackAdapterSnapshottingMock implements SlackAPIAdapter {
    snapshot: {
        searchedCommentSnapshots: any[];
        searchedChannels: any[];
        createdChannels: slack.ConversationsCreateArguments[];
        setChannelTopics: SetChannelTopicArguments[];
        invitesToChannels: InviteToChannelArguments[];
        kicksFromChannels: KickFromChannelArguments[];
        archivedChannels: slack.ConversationsCloseArguments[];
        sentMessages: SendMessageArguments[];
        lookedUpUsers: slack.UsersLookupByEmailArguments[];
    };

    constructor() {
        this.snapshot = {
            createdChannels: new Array<slack.ConversationsCreateArguments>(),
            setChannelTopics: new Array<SetChannelTopicArguments>(),
            invitesToChannels: new Array<InviteToChannelArguments>(),
            kicksFromChannels: new Array<KickFromChannelArguments>(),
            archivedChannels: new Array<slack.ConversationsCloseArguments>(),
            sentMessages: new Array<SendMessageArguments>(),
            lookedUpUsers: new Array<slack.UsersLookupByEmailArguments>(),
            searchedCommentSnapshots: new Array<any>(),
            searchedChannels: new Array<any>()
        };
    }

    getSlackUserIds(userPayloads: UserPayload[]): Promise<string[]> {
        userPayloads.forEach(u => this.snapshot.lookedUpUsers.push({ email: u.emailAddress }));
        return Promise.resolve(userPayloads.map(u => u.emailAddress));
    }

    findChannel(channelName: string, excludeArchived?: boolean): Promise<SlackChannelInfo | null> {
        this.snapshot.searchedChannels.push({ channelName, excludeArchived });
        return Promise.resolve({ isArchived: false, id: channelId });
    }

    createChannel(options: CreateChannelArguments): Promise<SlackChannelInfo> {
        this.snapshot.createdChannels.push(options);
        return Promise.resolve({ id: channelId, isArchived: false });
    }

    setChannelTopic(options: SetChannelTopicArguments): Promise<void> {
        this.snapshot.setChannelTopics.push(options);
        return Promise.resolve();
    }

    inviteToChannel(options: InviteToChannelArguments): Promise<void> {
        this.snapshot.invitesToChannels.push(options);
        return Promise.resolve();
    }

    kickFromChannel(options: KickFromChannelArguments): Promise<void> {
        this.snapshot.kicksFromChannels.push(options);
        return Promise.resolve();
    }

    archiveChannel(channelId: string): Promise<void> {
        this.snapshot.archivedChannels.push({ channel: channelId });
        return Promise.resolve();
    }

    sendMessage(options: SendMessageArguments): Promise<SendMessageResponse> {
        this.snapshot.sentMessages.push(options);
        return Promise.resolve({ ok: true, channelId: channelId, messageId: messageId });
    }

    findLatestBitbucketCommentSnapshot(channelId: string, bitbucketCommentId: number | string): Promise<BitbucketCommentSnapshot | null> {
        this.snapshot.searchedCommentSnapshots.push({ channelId, bitbucketCommentId });

        const snapshot = (<any>this.snapshot.sentMessages).findLast((m: SendMessageArguments) => m.metadata?.eventPayload?.commentId == bitbucketCommentId);

        if (snapshot) {
            const metadata = <BitbucketCommentSnapshotInSlackMetadata>snapshot.metadata?.eventPayload;
            return Promise.resolve({
                commentId: metadata.commentId,
                commentParentId: metadata.commentParentId,
                threadResolvedDate: metadata.threadResolvedDate,
                taskResolvedDate: metadata.taskResolvedDate,
                severity: metadata.severity,
                slackMessageId: messageId,
                slackThreadId: snapshot.threadId
            });
        } else {
            return Promise.resolve({
                commentId: bitbucketCommentId.toString(),
                severity: "NORMAL",
                slackMessageId: messageId
            });
        }
    }
}
