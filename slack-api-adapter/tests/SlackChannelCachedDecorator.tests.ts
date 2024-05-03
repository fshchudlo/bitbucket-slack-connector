import { SlackChannelCachedDecorator } from "../SlackChannelCachedDecorator";
import { snapshotCommentState } from "../../bitbucket-webhook-handler/use-cases/helpers";
import { PullRequestCommentActionNotification } from "../../bitbucket-payload-types";
import { register } from "prom-client";
import {
    BitbucketCommentSnapshot,
    BitbucketCommentSnapshotInSlackMetadata, SendMessageResponse, SlackChannel
} from "../../bitbucket-webhook-handler/SlackChannel";
import { SlackChannelFactory } from "../../channel-provisioning/SlackChannelFactory";
import { CHANNELS_CACHE } from "../CHANNELS_CACHE";
import { COMMENTS_CACHE } from "../COMMENTS_CACHE";
import { SlackChannelFactoryCachedDecorator } from "../SlackChannelFactoryCachedDecorator";


const decoratedChannelMock = {
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

const decoratedFactoryMock = {
    createChannel: jest.fn(),
    findExistingChannel: jest.fn()
} as SlackChannelFactory;


describe("SlackChannelCachedDecorator", () => {
    let systemUnderTest: SlackChannelCachedDecorator;
    let channelFactory: SlackChannelFactoryCachedDecorator;

    beforeEach(() => {
        systemUnderTest = new SlackChannelCachedDecorator(decoratedChannelMock as any);
        channelFactory = new SlackChannelFactoryCachedDecorator(decoratedFactoryMock as any);
        CHANNELS_CACHE.deleteWhere(() => true);
        COMMENTS_CACHE.deleteWhere(() => true);
    });

    afterEach(() => {
        jest.clearAllMocks();
        register.clear();
    });

    it("should delete channel info from cache when closing a channel", async () => {
        const channelData = {
            id: "channelId",
            name: "channelName",
            isArchived: false
        };
        (<jest.Mock>decoratedFactoryMock.createChannel).mockResolvedValue(channelData);
        (<jest.Mock>decoratedChannelMock.closeChannel).mockResolvedValue({});

        await channelFactory.createChannel({ name: channelData.name });
        expect(CHANNELS_CACHE.get(channelData.name)).not.toBeUndefined();

        await systemUnderTest.closeChannel(channelData.id);
        expect(CHANNELS_CACHE.get(channelData.name)).toBeUndefined();
    });

    it("should cache comment info when sending a message", async () => {
        const channelData = {
            id: "channelId",
            name: "channelName",
            isArchived: false
        };
        (<jest.Mock>decoratedFactoryMock.createChannel).mockResolvedValue(channelData);

        await channelFactory.createChannel({ name: channelData.name });

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
            channelId: channelData.id,
            metadata: snapshotCommentState(testPayload)
        });


        expect(await systemUnderTest.findLatestBitbucketCommentSnapshot(channelData.id, testPayload.comment.id)).toEqual(<BitbucketCommentSnapshot>{
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
        const channelData = {
            id: "channelId",
            name: "channelName",
            isArchived: false
        };

        (<jest.Mock>decoratedFactoryMock.findExistingChannel).mockResolvedValueOnce(channelData);
        const commentSnapshot = <BitbucketCommentSnapshotInSlackMetadata>{
            commentId: "1",
            severity: "NORMAL",
            thread_resolved: false
        };
        (<jest.Mock>decoratedChannelMock.findLatestBitbucketCommentSnapshot).mockResolvedValueOnce(commentSnapshot);

        const result = await systemUnderTest.findLatestBitbucketCommentSnapshot(channelData.id, commentSnapshot.commentId);

        expect(decoratedChannelMock.findLatestBitbucketCommentSnapshot).toHaveBeenCalledWith(channelData.id, commentSnapshot.commentId);
        expect(result).toEqual(commentSnapshot);
        expect(COMMENTS_CACHE.get("channelId-1")).toEqual(commentSnapshot);
    });

    it("should delete comment snapshots from cache when archiving a channel", async () => {
        const channelData = {
            id: "channelId",
            name: "channelName",
            isArchived: false
        };

        (<jest.Mock>decoratedFactoryMock.findExistingChannel).mockResolvedValueOnce(channelData);
        const commentSnapshot = <BitbucketCommentSnapshotInSlackMetadata>{
            commentId: "1",
            severity: "NORMAL",
            thread_resolved: false
        };
        (<jest.Mock>decoratedChannelMock.findLatestBitbucketCommentSnapshot).mockResolvedValueOnce(commentSnapshot);

        await systemUnderTest.findLatestBitbucketCommentSnapshot(channelData.id, commentSnapshot.commentId);

        expect(COMMENTS_CACHE.get("channelId-1")).toEqual(commentSnapshot);

        (<jest.Mock>decoratedChannelMock.closeChannel).mockResolvedValue({});

        await systemUnderTest.closeChannel("channelId");

        expect(COMMENTS_CACHE.get("channelId-1")).toBeUndefined();

    });
});