import { SlackChannelCachedDecorator } from "../SlackChannelCachedDecorator";
import { snapshotCommentState } from "../../../bitbucket-webhook-handler/use-case-handlers/utils";
import { PullRequestCommentActionNotification } from "../../../bitbucket-payload-types";
import { register } from "prom-client";
import {
    BitbucketCommentSnapshot,
    BitbucketCommentSnapshotInSlackMetadata, SendMessageResponse, SlackChannel
} from "../../../bitbucket-webhook-handler/SlackChannel";
import { CHANNELS_CACHE } from "../../CHANNELS_CACHE";
import { COMMENTS_CACHE } from "../../COMMENTS_CACHE";


const decoratedChannelMock = {
    channelInfo: {
        id: "channelId",
        name: "channelName"
    },
    addBookmark: jest.fn(),
    addReaction: jest.fn(),
    closeChannel: jest.fn(),
    findLatestBitbucketCommentSnapshot: jest.fn(),
    findPROpenedBroadcastMessageId: jest.fn(),
    getSlackUserIds: jest.fn(),
    inviteToChannel: jest.fn(),
    kickFromChannel: jest.fn(),
    sendMessage: jest.fn()
} as SlackChannel;


describe("SlackChannelCachedDecorator", () => {
    let systemUnderTest: SlackChannelCachedDecorator;

    beforeEach(() => {
        systemUnderTest = new SlackChannelCachedDecorator(decoratedChannelMock as any);
        CHANNELS_CACHE.deleteWhere(() => true);
        COMMENTS_CACHE.deleteWhere(() => true);
    });

    afterEach(() => {
        jest.clearAllMocks();
        register.clear();
    });

    it("should delete channel info from cache when closing a channel", async () => {
        (<jest.Mock>decoratedChannelMock.closeChannel).mockResolvedValue({});

        CHANNELS_CACHE.set(decoratedChannelMock.channelInfo.name, decoratedChannelMock.channelInfo);
        expect(CHANNELS_CACHE.get(decoratedChannelMock.channelInfo.name)).not.toBeUndefined();

        await systemUnderTest.closeChannel();
        expect(CHANNELS_CACHE.get(decoratedChannelMock.channelInfo.name)).toBeUndefined();
    });

    it("should cache comment info when sending a message", async () => {
        (<jest.Mock>decoratedChannelMock.sendMessage).mockResolvedValue(<SendMessageResponse>{
            messageId: "ABCDE"
        });

        const testPayload = {
            comment: {
                id: 1,
                severity: "NORMAL",
                threadResolvedDate: 123456789
            },
            commentParentId: undefined
        } as PullRequestCommentActionNotification;

        await systemUnderTest.sendMessage({
            metadata: snapshotCommentState(testPayload)
        });


        expect(await systemUnderTest.findLatestBitbucketCommentSnapshot(testPayload.comment.id)).toEqual(<BitbucketCommentSnapshot>{
            commentId: testPayload.comment.id.toString(),
            commentParentId: testPayload.commentParentId?.toString(),
            severity: testPayload.comment.severity,
            threadResolvedDate: testPayload.comment.threadResolvedDate,
            taskResolvedDate: testPayload.comment.resolvedDate,
            slackMessageId: "ABCDE",
            slackThreadId: undefined
        });
        expect(decoratedChannelMock.findLatestBitbucketCommentSnapshot).not.toHaveBeenCalled();
    });

    it("should fetch comment snapshot from gateway and save in cache", async () => {
        const commentSnapshot = <BitbucketCommentSnapshotInSlackMetadata>{
            commentId: "1",
            severity: "NORMAL",
            thread_resolved: false
        };
        (<jest.Mock>decoratedChannelMock.findLatestBitbucketCommentSnapshot).mockResolvedValueOnce(commentSnapshot);

        const result = await systemUnderTest.findLatestBitbucketCommentSnapshot(commentSnapshot.commentId);

        expect(decoratedChannelMock.findLatestBitbucketCommentSnapshot).toHaveBeenCalledWith(commentSnapshot.commentId);
        expect(result).toEqual(commentSnapshot);
        expect(COMMENTS_CACHE.get("channelId-1")).toEqual(commentSnapshot);
    });

    it("should delete comment snapshots from cache when archiving a channel", async () => {
        const commentSnapshot = <BitbucketCommentSnapshotInSlackMetadata>{
            commentId: "1",
            severity: "NORMAL",
            thread_resolved: false
        };
        (<jest.Mock>decoratedChannelMock.findLatestBitbucketCommentSnapshot).mockResolvedValueOnce(commentSnapshot);

        await systemUnderTest.findLatestBitbucketCommentSnapshot(commentSnapshot.commentId);

        expect(COMMENTS_CACHE.get("channelId-1")).toEqual(commentSnapshot);

        (<jest.Mock>decoratedChannelMock.closeChannel).mockResolvedValue({});

        await systemUnderTest.closeChannel();

        expect(COMMENTS_CACHE.get("channelId-1")).toBeUndefined();

    });
});