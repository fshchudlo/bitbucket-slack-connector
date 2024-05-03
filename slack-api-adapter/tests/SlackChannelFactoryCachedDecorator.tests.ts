import { register } from "prom-client";
import { SlackChannelFactory } from "../../channel-provisioning/SlackChannelFactory";
import { CHANNELS_CACHE } from "../CHANNELS_CACHE";
import { COMMENTS_CACHE } from "../COMMENTS_CACHE";
import { SlackChannelFactoryCachedDecorator } from "../SlackChannelFactoryCachedDecorator";


const decoratedFactoryMock = (<SlackChannelFactory>{
    createChannel: jest.fn(),
    findExistingChannel: jest.fn()
}) as any;

describe("SlackChannelFactoryCachedDecorator", () => {
    let systemUnderTest: SlackChannelFactoryCachedDecorator;

    beforeEach(() => {
        systemUnderTest = new SlackChannelFactoryCachedDecorator(decoratedFactoryMock as any);
        CHANNELS_CACHE.deleteWhere(() => true);
        COMMENTS_CACHE.deleteWhere(() => true);
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
        decoratedFactoryMock.createChannel.mockResolvedValue(channelData);

        await systemUnderTest.createChannel({ name: channelData.name });

        expect(CHANNELS_CACHE.get(channelData.name)).toEqual(channelData);
    });

    it("should get channel info from cache if available", async () => {
        const channelData = {
            id: "channelId",
            name: "channelName",
            isArchived: false
        };
        CHANNELS_CACHE.set(channelData.name, channelData);

        const result = await systemUnderTest.findExistingChannel(channelData.name, true);

        expect(result).toEqual(channelData);
        expect(decoratedFactoryMock.findExistingChannel).not.toHaveBeenCalled();
    });

    it("should fetch channel info from gateway and save in cache", async () => {
        const channelData = {
            id: "channelId",
            name: "channelName",
            isArchived: false
        };
        decoratedFactoryMock.findExistingChannel.mockResolvedValueOnce(channelData);
        expect(CHANNELS_CACHE.get(channelData.name)).toBeUndefined();

        const result = await systemUnderTest.findExistingChannel("channelName", true);

        expect(result).toEqual(channelData);
        expect(CHANNELS_CACHE.get(channelData.name)).toEqual(channelData);
    });
});