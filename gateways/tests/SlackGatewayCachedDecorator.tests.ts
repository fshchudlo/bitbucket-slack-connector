import { SlackGatewayCachedDecorator } from "../SlackGatewayCachedDecorator";
import { snapshotCommentAsSlackMetadata } from "../../webhook-handler/slack-building-blocks";
import { BitbucketCommentSnapshotInSlackMetadata, PullRequestCommentActionNotification } from "../../typings";
import { register } from "prom-client";


const decoratedGatewayMock = {
    createChannel: jest.fn(),
    getChannelInfo: jest.fn(),
    archiveChannel: jest.fn(),
    getSlackUserIds: jest.fn(),
    setChannelTopic: jest.fn(),
    inviteToChannel: jest.fn(),
    kickFromChannel: jest.fn(),
    sendMessage: jest.fn(),
    findLatestBitbucketCommentSnapshot: jest.fn()
};

describe("SlackGatewayCachedDecorator", () => {
    let systemUnderTest: SlackGatewayCachedDecorator;

    beforeEach(() => {
        systemUnderTest = new SlackGatewayCachedDecorator(decoratedGatewayMock as any);
    });

    afterEach(() => {
        jest.clearAllMocks();
        register.clear();
    });

    it("should cache channel info when creating a channel", async () => {
        const channelData = {
            id: "channelId",
            name: "channelName",
            is_archived: false
        };
        decoratedGatewayMock.createChannel.mockResolvedValue({ channel: channelData });

        await systemUnderTest.createChannel({ name: channelData.name });

        expect(systemUnderTest.channelsCache.get(channelData.name)).toEqual({
            id: channelData.id,
            name: channelData.name,
            isArchived: channelData.is_archived
        });
    });

    it("should delete channel info from cache when archiving a channel", async () => {
        const channelData = {
            id: "channelId",
            name: "channelName",
            is_archived: false
        };
        decoratedGatewayMock.createChannel.mockResolvedValue({ channel: channelData });
        decoratedGatewayMock.archiveChannel.mockResolvedValue({});

        await systemUnderTest.createChannel({ name: channelData.name });
        expect(systemUnderTest.channelsCache.get(channelData.name)).not.toBeUndefined();

        await systemUnderTest.archiveChannel(channelData.id);
        expect(systemUnderTest.channelsCache.get(channelData.name)).toBeUndefined();
    });

    it("should get channel info from cache if available", async () => {
        const channelData = {
            id: "channelId",
            name: "channelName",
            isArchived: false
        };
        systemUnderTest.channelsCache.set(channelData.name, channelData);

        const result = await systemUnderTest.getChannelInfo(channelData.name);

        expect(result).toEqual(channelData);
        expect(decoratedGatewayMock.getChannelInfo).not.toHaveBeenCalled();
    });

    it("should fetch channel info from gateway and save in cache", async () => {
        const channelData = {
            id: "channelId",
            name: "channelName",
            isArchived: false
        };
        decoratedGatewayMock.getChannelInfo.mockResolvedValueOnce(channelData);
        expect(systemUnderTest.channelsCache.get(channelData.name)).toBeUndefined();

        const result = await systemUnderTest.getChannelInfo("channelName");

        expect(result).toEqual(channelData);
        expect(systemUnderTest.channelsCache.get(channelData.name)).toEqual(channelData);
    });

    it("should cache comment info when sending a message", async () => {
        const channelData = {
            id: "channelId",
            name: "channelName",
            is_archived: false
        };
        decoratedGatewayMock.createChannel.mockResolvedValue({ channel: channelData });

        await systemUnderTest.createChannel({ name: channelData.name });

        decoratedGatewayMock.sendMessage.mockResolvedValue({
            channel: channelData.id
        });

        const testPayload = {
            comment: {
                id: 1,
                severity: "NORMAL",
                threadResolved: false
            }
        } as PullRequestCommentActionNotification;

        await systemUnderTest.sendMessage({
            channel: channelData.name,
            metadata: snapshotCommentAsSlackMetadata(testPayload)
        });


        expect(await systemUnderTest.findLatestBitbucketCommentSnapshot(channelData.name, testPayload.comment.id)).toEqual({
            comment_id: testPayload.comment.id.toString(),
            severity: testPayload.comment.severity,
            thread_resolved: testPayload.comment.threadResolved
        });
        expect(decoratedGatewayMock.findLatestBitbucketCommentSnapshot).not.toHaveBeenCalled();
    });

    it("should fetch comment snapshot from gateway and save in cache", async () => {
        const channelData = {
            id: "channelId",
            name: "channelName",
            is_archived: false
        };

        decoratedGatewayMock.getChannelInfo.mockResolvedValueOnce(channelData);
        const commentSnapshot = <BitbucketCommentSnapshotInSlackMetadata>{
            comment_id: "1",
            severity: "NORMAL",
            thread_resolved: false
        };
        decoratedGatewayMock.findLatestBitbucketCommentSnapshot.mockResolvedValueOnce(commentSnapshot);

        const result = await systemUnderTest.findLatestBitbucketCommentSnapshot(channelData.name, commentSnapshot.comment_id);

        expect(decoratedGatewayMock.findLatestBitbucketCommentSnapshot).toHaveBeenCalledWith(channelData.name, commentSnapshot.comment_id);
        expect(result).toEqual(commentSnapshot);
        expect(systemUnderTest.bitbucketCommentsCache.get("channelId-1")).toEqual(commentSnapshot);
    });

    it("should delete comment snapshots from cache when archiving a channel", async () => {
        const channelData = {
            id: "channelId",
            name: "channelName",
            is_archived: false
        };

        decoratedGatewayMock.getChannelInfo.mockResolvedValueOnce(channelData);
        const commentSnapshot = <BitbucketCommentSnapshotInSlackMetadata>{
            comment_id: "1",
            severity: "NORMAL",
            thread_resolved: false
        };
        decoratedGatewayMock.findLatestBitbucketCommentSnapshot.mockResolvedValueOnce(commentSnapshot);

        await systemUnderTest.findLatestBitbucketCommentSnapshot(channelData.name, commentSnapshot.comment_id);

        expect(systemUnderTest.bitbucketCommentsCache.get("channelId-1")).toEqual(commentSnapshot);

        decoratedGatewayMock.archiveChannel.mockResolvedValue({});

        await systemUnderTest.archiveChannel("channelId");

        expect(systemUnderTest.bitbucketCommentsCache.get("channelId-1")).toBeUndefined();

    });
});