import {
    SlackChannel,
    BitbucketCommentSnapshot,
    AddBookmarkArguments,
    InviteToChannelArguments,
    KickFromChannelArguments,
    SendMessageArguments,
    SendMessageResponse,
    BitbucketCommentSnapshotInSlackMetadata,
    PullRequestSnapshotInSlackMetadata
} from "../bitbucket-webhook-handler/SlackChannel";
import {
    SNAPSHOT_PULL_REQUEST_STATE_EVENT_TYPE
} from "../bitbucket-webhook-handler/use-cases/helpers/snapshotPullRequestState";
import { SNAPSHOT_COMMENT_STATE_EVENT_TYPE } from "../bitbucket-webhook-handler/use-cases/helpers";
import { SlackChannelInfo } from "../channel-provisioning/SlackChannelFactory";

const messageId = "ABCDE";
export default class SlackChannelSnapshottingMock implements SlackChannel {
    snapshot: {
        addedReactions: any[];
        addedBookmarks: AddBookmarkArguments[];
        closeChannelCalls: string[];
        invitesToChannels: InviteToChannelArguments[];
        kicksFromChannels: KickFromChannelArguments[];
        lookedUpUsers: Array<Array<string>>;
        searchedCommentSnapshots: any[];
        searchedPrOpenedBroadcastMessages: any[];
        sentMessages: SendMessageArguments[];
    };

    constructor() {
        this.snapshot = {
            addedReactions: new Array<any>(),
            addedBookmarks: new Array<AddBookmarkArguments>(),
            closeChannelCalls: new Array<string>(),
            invitesToChannels: new Array<InviteToChannelArguments>(),
            kicksFromChannels: new Array<KickFromChannelArguments>(),
            lookedUpUsers: new Array<Array<string>>(),
            searchedCommentSnapshots: new Array<any>(),
            searchedPrOpenedBroadcastMessages: new Array<any>(),
            sentMessages: new Array<SendMessageArguments>()
        };
    }

    readonly channelInfo: SlackChannelInfo = {
        id: "12345",
        isArchived: false,
        name: "test-channel"
    };

    getSlackUserIds(userEmails: string[]): Promise<string[]> {
        this.snapshot.lookedUpUsers.push(userEmails);
        return Promise.resolve(userEmails);
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

    closeChannel(): Promise<void> {
        this.snapshot.closeChannelCalls.push(this.channelInfo.id);
        return Promise.resolve();
    }

    addReaction(messageId: string, reaction: string): Promise<void> {
        this.snapshot.addedReactions.push({ channelId: this.channelInfo.id, messageId, reaction });
        return Promise.resolve();
    }

    sendMessage(options: SendMessageArguments): Promise<SendMessageResponse> {
        this.snapshot.sentMessages.push(options);
        return Promise.resolve({ ok: true, channelId: this.channelInfo.id, messageId: messageId });
    }

    findLatestBitbucketCommentSnapshot(bitbucketCommentId: number | string): Promise<BitbucketCommentSnapshot | null> {
        this.snapshot.searchedCommentSnapshots.push({ channelId: this.channelInfo.id, bitbucketCommentId });

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

    findPROpenedBroadcastMessageId(prCreationDate: Date, pullRequestTraits: PullRequestSnapshotInSlackMetadata): Promise<string | null> {
        this.snapshot.searchedPrOpenedBroadcastMessages.push({
            channelId: this.channelInfo.id,
            prCreationDate,
            pullRequestTraits
        });

        const snapshot = (<any>this.snapshot.sentMessages).findLast((m: SendMessageArguments) => m.metadata?.eventType === SNAPSHOT_PULL_REQUEST_STATE_EVENT_TYPE && m.metadata?.eventPayload?.pullRequestId === pullRequestTraits.pullRequestId && m.metadata?.eventPayload?.projectKey === pullRequestTraits.projectKey && m.metadata?.eventPayload?.repositorySlug === pullRequestTraits.repositorySlug);

        if (snapshot) {
            return Promise.resolve(messageId);
        }
        return Promise.resolve(null);
    }
}
