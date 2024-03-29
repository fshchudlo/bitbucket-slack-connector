import { SlackGatewayCachedDecorator } from "./SlackGatewayCachedDecorator";

const mockGateway = {
    createChannel: jest.fn(),
    getChannelInfo: jest.fn(),
    archiveChannel: jest.fn(),
    getSlackUserIds: jest.fn(),
    setChannelTopic: jest.fn(),
    inviteToChannel: jest.fn(),
    kickFromChannel: jest.fn(),
    sendMessage: jest.fn()
};

describe("SlackGatewayCachedDecorator", () => {
    let cachedGatewayDecorator: SlackGatewayCachedDecorator;

    beforeEach(() => {
        cachedGatewayDecorator = new SlackGatewayCachedDecorator(mockGateway as any);
        jest.spyOn(cachedGatewayDecorator.channelsCache, "set");
        jest.spyOn(cachedGatewayDecorator.channelsCache, "deleteWhere");
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should cache channel info when creating a channel", async () => {
        mockGateway.createChannel.mockResolvedValue({
            channel: {
                id: "channelId",
                name: "channelName",
                is_archived: false
            }
        });

        await cachedGatewayDecorator.createChannel({ name: "channelName" });

        expect(cachedGatewayDecorator.channelsCache.set).toHaveBeenCalledWith("channelName", {
            id: "channelId",
            name: "channelName",
            isArchived: false
        });
    });

    it("should delete channel info from cache when archiving a channel", async () => {
        mockGateway.archiveChannel.mockResolvedValue({});

        await cachedGatewayDecorator.archiveChannel("channelId");

        expect(cachedGatewayDecorator.channelsCache.deleteWhere).toHaveBeenCalled();
    });

    it("should get channel info from cache if available", async () => {
        const cachedChannelInfo = {
            id: "channelId",
            name: "channelName",
            isArchived: false
        };
        cachedGatewayDecorator.channelsCache.set(cachedChannelInfo.name, cachedChannelInfo);

        const result = await cachedGatewayDecorator.getChannelInfo("channelName");

        expect(result).toEqual(cachedChannelInfo);
        expect(mockGateway.getChannelInfo).not.toHaveBeenCalled();
    });

    it("should fetch channel info from gateway and save in cache", async () => {
        const channelInfo = {
            id: "channelId",
            name: "channelName",
            isArchived: false
        };
        mockGateway.getChannelInfo.mockResolvedValueOnce(channelInfo);

        const result = await cachedGatewayDecorator.getChannelInfo("channelName");

        expect(mockGateway.getChannelInfo).toHaveBeenCalledWith("channelName", undefined);
        expect(result).toEqual(channelInfo);
        expect(cachedGatewayDecorator.channelsCache.set).toHaveBeenCalledWith("channelName", channelInfo);
    });
});