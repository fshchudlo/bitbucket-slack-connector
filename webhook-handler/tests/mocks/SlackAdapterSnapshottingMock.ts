import {
    SlackAPIAdapter,
    SlackChannelInfo,
    BitbucketCommentSnapshot,
    CreateChannelArguments,
    AddBookmarkArguments,
    InviteToChannelArguments,
    KickFromChannelArguments,
    SendMessageArguments,
    SendMessageResponse,
    BitbucketCommentSnapshotInSlackMetadata,
    PullRequestSnapshotInSlackMetadata
} from "../../ports/SlackAPIAdapter";
import { UserPayload } from "../../../typings";
import { SNAPSHOT_PULL_REQUEST_STATE_EVENT_TYPE } from "../../use-cases/helpers/snapshotPullRequestState";
import { SNAPSHOT_COMMENT_STATE_EVENT_TYPE } from "../../use-cases/helpers";

const channelId = "12345";
const messageId = "ABCDE";
export default class SlackAdapterSnapshottingMock implements SlackAPIAdapter {
    snapshot: {
        addedReactions: any[];
        addedBookmarks: AddBookmarkArguments[];
        archivedChannels: string[];
        createdChannels: CreateChannelArguments[];
        invitesToChannels: InviteToChannelArguments[];
        kicksFromChannels: KickFromChannelArguments[];
        lookedUpUsers: Array<Array<UserPayload>>;
        searchedChannels: any[];
        searchedCommentSnapshots: any[];
        searchedPrOpenedBroadcastMessages: any[];
        sentMessages: SendMessageArguments[];
    };

    constructor() {
        this.snapshot = {
            addedReactions: new Array<any>(),
            addedBookmarks: new Array<AddBookmarkArguments>(),
            archivedChannels: new Array<string>(),
            createdChannels: new Array<CreateChannelArguments>(),
            invitesToChannels: new Array<InviteToChannelArguments>(),
            kicksFromChannels: new Array<KickFromChannelArguments>(),
            lookedUpUsers: new Array<Array<UserPayload>>(),
            searchedCommentSnapshots: new Array<any>(),
            searchedPrOpenedBroadcastMessages: new Array<any>(),
            searchedChannels: new Array<any>(),
            sentMessages: new Array<SendMessageArguments>()
        };
    }

    getSlackUserIds(userPayloads: UserPayload[]): Promise<string[]> {
        this.snapshot.lookedUpUsers.push(userPayloads);
        return Promise.resolve(userPayloads.map(u => u.emailAddress));
    }

    findChannel(channelName: string): Promise<SlackChannelInfo | null> {
        this.snapshot.searchedChannels.push(channelName);
        return Promise.resolve({ id: channelId, name: channelName, isArchived: false });
    }

    createChannel(options: CreateChannelArguments): Promise<SlackChannelInfo> {
        this.snapshot.createdChannels.push(options);
        return Promise.resolve({ id: channelId, name: options.name, isArchived: false });
    }

    addBookmark(options: AddBookmarkArguments): Promise<void> {
        this.snapshot.addedBookmarks.push(options);
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
        this.snapshot.archivedChannels.push(channelId);
        return Promise.resolve();
    }

    addReaction(channelId: string, messageId: string, reaction: string): Promise<void> {
        this.snapshot.addedReactions.push({ channelId, messageId, reaction });
        return Promise.resolve();
    }

    sendMessage(options: SendMessageArguments): Promise<SendMessageResponse> {
        this.snapshot.sentMessages.push(options);
        return Promise.resolve({ ok: true, channelId: channelId, messageId: messageId });
    }

    findLatestBitbucketCommentSnapshot(channelId: string, bitbucketCommentId: number | string): Promise<BitbucketCommentSnapshot | null> {
        this.snapshot.searchedCommentSnapshots.push({ channelId, bitbucketCommentId });

        const snapshot = (<any>this.snapshot.sentMessages).findLast((m: SendMessageArguments) => m.metadata?.eventType === SNAPSHOT_COMMENT_STATE_EVENT_TYPE && m.metadata?.eventPayload?.commentId === bitbucketCommentId.toString());

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
        }
        return Promise.resolve(null);
    }

    findPROpenedBroadcastMessageId(channelId: string, prCreationDate: Date, pullRequestTraits: PullRequestSnapshotInSlackMetadata): Promise<string | null> {
        this.snapshot.searchedPrOpenedBroadcastMessages.push({ channelId, prCreationDate, pullRequestTraits });

        const snapshot = (<any>this.snapshot.sentMessages).findLast((m: SendMessageArguments) => m.metadata?.eventType === SNAPSHOT_PULL_REQUEST_STATE_EVENT_TYPE && m.metadata?.eventPayload?.pullRequestId === pullRequestTraits.pullRequestId && m.metadata?.eventPayload?.projectKey === pullRequestTraits.projectKey && m.metadata?.eventPayload?.repositorySlug === pullRequestTraits.repositorySlug);

        if (snapshot) {
            return Promise.resolve(messageId);
        }
        return Promise.resolve(null);
    }
}
