import { SlackGatewayCachedDecorator } from "../SlackGatewayCachedDecorator";
import { snapshotCommentAsSlackMetadata } from "../../webhook-handler/slack-building-blocks";
import { BitbucketCommentSnapshotInSlackMetadata, PullRequestCommentActionNotification } from "../../typings";

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
    let decorator: SlackGatewayCachedDecorator;

    beforeEach(() => {
        decorator = new SlackGatewayCachedDecorator(decoratedGatewayMock as any);
        jest.spyOn(decorator.channelsCache, "set");
        jest.spyOn(decorator.channelsCache, "deleteWhere");
        jest.spyOn(decorator.bitbucketCommentsCache, "set");
        jest.spyOn(decorator.bitbucketCommentsCache, "deleteWhere");
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should cache channel info when creating a channel", async () => {
        decoratedGatewayMock.createChannel.mockResolvedValue({
            channel: {
                id: "channelId",
                name: "channelName",
                is_archived: false
            }
        });

        await decorator.createChannel({ name: "channelName" });

        expect(decorator.channelsCache.set).toHaveBeenCalledWith("channelName", {
            id: "channelId",
            name: "channelName",
            isArchived: false
        });
    });

    it("should delete channel info from cache when archiving a channel", async () => {
        decoratedGatewayMock.archiveChannel.mockResolvedValue({});

        await decorator.archiveChannel("channelId");

        expect(decorator.channelsCache.deleteWhere).toHaveBeenCalled();
    });

    it("should get channel info from cache if available", async () => {
        const cachedChannelInfo = {
            id: "channelId",
            name: "channelName",
            isArchived: false
        };
        decorator.channelsCache.set(cachedChannelInfo.name, cachedChannelInfo);

        const result = await decorator.getChannelInfo("channelName");

        expect(result).toEqual(cachedChannelInfo);
        expect(decoratedGatewayMock.getChannelInfo).not.toHaveBeenCalled();
        expect(decorator.channelsCacheHits).toEqual(1);
        expect(decorator.channelsCacheMisses).toEqual(0);
    });

    it("should fetch channel info from gateway and save in cache", async () => {
        const channelInfo = {
            id: "channelId",
            name: "channelName",
            isArchived: false
        };
        decoratedGatewayMock.getChannelInfo.mockResolvedValueOnce(channelInfo);

        const result = await decorator.getChannelInfo("channelName");

        expect(decoratedGatewayMock.getChannelInfo).toHaveBeenCalledWith("channelName", undefined);
        expect(result).toEqual(channelInfo);
        expect(decorator.channelsCacheHits).toEqual(0);
        expect(decorator.channelsCacheMisses).toEqual(1);
        expect(decorator.channelsCache.set).toHaveBeenCalledWith("channelName", channelInfo);
    });

    it("should cache comment info when sending a message", async () => {
        decoratedGatewayMock.sendMessage.mockResolvedValue({
            channel: "channelId"
        });

        await decorator.sendMessage({
            channel: "channelName",
            metadata: snapshotCommentAsSlackMetadata({
                comment: {
                    id: 1,
                    severity: "NORMAL",
                    threadResolved: false
                }
            } as PullRequestCommentActionNotification)
        });

        expect(decorator.bitbucketCommentsCache.set).toHaveBeenCalledWith("channelId-1", {
            comment_id: "1",
            severity: "NORMAL",
            thread_resolved: false
        });
    });

    it("should delete comment snapshots from cache when archiving a channel", async () => {
        decoratedGatewayMock.archiveChannel.mockResolvedValue({});

        await decorator.archiveChannel("channelId");

        expect(decorator.bitbucketCommentsCache.deleteWhere).toHaveBeenCalled();
    });


    it("should get comment snapshot from cache if available", async () => {
        decoratedGatewayMock.getChannelInfo.mockResolvedValueOnce({
            id: "channelId",
            name: "channelName",
            isArchived: false
        });

        const commentSnapshot = <BitbucketCommentSnapshotInSlackMetadata>{
            comment_id: "1",
            severity: "NORMAL",
            thread_resolved: false
        };
        decorator.bitbucketCommentsCache.set("channelId-1", commentSnapshot);

        const result = await decorator.findLatestBitbucketCommentSnapshot("channelName", 1);

        expect(result).toEqual(commentSnapshot);
        expect(decoratedGatewayMock.findLatestBitbucketCommentSnapshot).not.toHaveBeenCalled();
        expect(decorator.bitbucketCommentsCacheHits).toEqual(1);
        expect(decorator.bitbucketCommentsCacheMisses).toEqual(0);
    });

    it("should fetch comment snapshot from gateway and save in cache", async () => {
        decoratedGatewayMock.getChannelInfo.mockResolvedValueOnce({
            id: "channelId",
            name: "channelName",
            isArchived: false
        });

        const commentSnapshot = <BitbucketCommentSnapshotInSlackMetadata>{
            comment_id: "1",
            severity: "NORMAL",
            thread_resolved: false
        };
        decoratedGatewayMock.findLatestBitbucketCommentSnapshot.mockResolvedValueOnce(commentSnapshot);

        const result = await decorator.findLatestBitbucketCommentSnapshot("channelName", 1);

        expect(decoratedGatewayMock.findLatestBitbucketCommentSnapshot).toHaveBeenCalledWith("channelName", 1);
        expect(result).toEqual(commentSnapshot);
        expect(decorator.bitbucketCommentsCacheHits).toEqual(0);
        expect(decorator.bitbucketCommentsCacheMisses).toEqual(1);
        expect(decorator.bitbucketCommentsCache.set).toHaveBeenCalledWith("channelId-1", commentSnapshot);
    });
});