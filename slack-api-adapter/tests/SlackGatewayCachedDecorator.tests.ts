import { SlackAPIAdapterCachedDecorator } from "../SlackAPIAdapterCachedDecorator";
import { snapshotCommentState } from "../../bitbucket-webhook-handler/use-cases/helpers";
import { PullRequestCommentActionNotification } from "../../bitbucket-payload-types";
import { register } from "prom-client";
import {
    BitbucketCommentSnapshot,
    BitbucketCommentSnapshotInSlackMetadata, SendMessageResponse, SlackNotificationChannel
} from "../../bitbucket-webhook-handler/SlackNotificationChannel";
import { SlackChannelFactory } from "../../channel-provisioning/SlackChannelFactory";


const decoratedGatewayMock = (<SlackChannelFactory & SlackNotificationChannel>{
    addBookmark: jest.fn(),
    addReaction: jest.fn(),
    closeChannel: jest.fn(),
    createChannel: jest.fn(),
    findChannel: jest.fn(),
    findLatestBitbucketCommentSnapshot: jest.fn(),
    findPROpenedBroadcastMessageId: jest.fn(),
    getSlackUserIds: jest.fn(),
    inviteToChannel: jest.fn(),
    kickFromChannel: jest.fn(),
    sendMessage: jest.fn()
}) as any;

describe("SlackGatewayCachedDecorator", () => {
    let systemUnderTest: SlackAPIAdapterCachedDecorator;

    beforeEach(() => {
        systemUnderTest = new SlackAPIAdapterCachedDecorator(decoratedGatewayMock as any, decoratedGatewayMock as any);
    });

    afterEach(() => {
        jest.clearAllMocks();
        register.clear();
    });

    it("should cache channel info when creating a channel", async () => {
        const channelData = {
            id: "channelId",
            name: "channelName",
            isArchived: false
        };
        decoratedGatewayMock.createChannel.mockResolvedValue(channelData);

        await systemUnderTest.createChannel({ name: channelData.name });

        expect(systemUnderTest.channelsCache.get(channelData.name)).toEqual(channelData);
    });

    it("should delete channel info from cache when archiving a channel", async () => {
        const channelData = {
            id: "channelId",
            name: "channelName",
            isArchived: false
        };
        decoratedGatewayMock.createChannel.mockResolvedValue(channelData);
        decoratedGatewayMock.closeChannel.mockResolvedValue({});

        await systemUnderTest.createChannel({ name: channelData.name });
        expect(systemUnderTest.channelsCache.get(channelData.name)).not.toBeUndefined();

        await systemUnderTest.closeChannel(channelData.id);
        expect(systemUnderTest.channelsCache.get(channelData.name)).toBeUndefined();
    });

    it("should get channel info from cache if available", async () => {
        const channelData = {
            id: "channelId",
            name: "channelName",
            isArchived: false
        };
        systemUnderTest.channelsCache.set(channelData.name, channelData);

        const result = await systemUnderTest.findChannel(channelData.name, true);

        expect(result).toEqual(channelData);
        expect(decoratedGatewayMock.findChannel).not.toHaveBeenCalled();
    });

    it("should fetch channel info from gateway and save in cache", async () => {
        const channelData = {
            id: "channelId",
            name: "channelName",
            isArchived: false
        };
        decoratedGatewayMock.findChannel.mockResolvedValueOnce(channelData);
        expect(systemUnderTest.channelsCache.get(channelData.name)).toBeUndefined();

        const result = await systemUnderTest.findChannel("channelName", true);

        expect(result).toEqual(channelData);
        expect(systemUnderTest.channelsCache.get(channelData.name)).toEqual(channelData);
    });

    it("should cache comment info when sending a message", async () => {
        const channelData = {
            id: "channelId",
            name: "channelName",
            isArchived: false
        };
        decoratedGatewayMock.createChannel.mockResolvedValue(channelData);

        await systemUnderTest.createChannel({ name: channelData.name });

        decoratedGatewayMock.sendMessage.mockResolvedValue(<SendMessageResponse>{
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
        expect(decoratedGatewayMock.findLatestBitbucketCommentSnapshot).not.toHaveBeenCalled();
    });

    it("should fetch comment snapshot from gateway and save in cache", async () => {
        const channelData = {
            id: "channelId",
            name: "channelName",
            isArchived: false
        };

        decoratedGatewayMock.findChannel.mockResolvedValueOnce(channelData);
        const commentSnapshot = <BitbucketCommentSnapshotInSlackMetadata>{
            commentId: "1",
            severity: "NORMAL",
            thread_resolved: false
        };
        decoratedGatewayMock.findLatestBitbucketCommentSnapshot.mockResolvedValueOnce(commentSnapshot);

        const result = await systemUnderTest.findLatestBitbucketCommentSnapshot(channelData.id, commentSnapshot.commentId);

        expect(decoratedGatewayMock.findLatestBitbucketCommentSnapshot).toHaveBeenCalledWith(channelData.id, commentSnapshot.commentId);
        expect(result).toEqual(commentSnapshot);
        expect(systemUnderTest.bitbucketCommentsCache.get("channelId-1")).toEqual(commentSnapshot);
    });

    it("should delete comment snapshots from cache when archiving a channel", async () => {
        const channelData = {
            id: "channelId",
            name: "channelName",
            isArchived: false
        };

        decoratedGatewayMock.findChannel.mockResolvedValueOnce(channelData);
        const commentSnapshot = <BitbucketCommentSnapshotInSlackMetadata>{
            commentId: "1",
            severity: "NORMAL",
            thread_resolved: false
        };
        decoratedGatewayMock.findLatestBitbucketCommentSnapshot.mockResolvedValueOnce(commentSnapshot);

        await systemUnderTest.findLatestBitbucketCommentSnapshot(channelData.id, commentSnapshot.commentId);

        expect(systemUnderTest.bitbucketCommentsCache.get("channelId-1")).toEqual(commentSnapshot);

        decoratedGatewayMock.closeChannel.mockResolvedValue({});

        await systemUnderTest.closeChannel("channelId");

        expect(systemUnderTest.bitbucketCommentsCache.get("channelId-1")).toBeUndefined();

    });
});