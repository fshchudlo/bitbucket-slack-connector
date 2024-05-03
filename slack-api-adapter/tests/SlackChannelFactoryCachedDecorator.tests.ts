import { register } from "prom-client";
import { SlackChannelFactory } from "../../channel-provisioning/SlackChannelFactory";
import { CHANNELS_CACHE } from "../CHANNELS_CACHE";
import { COMMENTS_CACHE } from "../COMMENTS_CACHE";
import { SlackChannelFactoryCachedDecorator } from "../SlackChannelFactoryCachedDecorator";


const decoratedFactoryMock = (<SlackChannelFactory>{
    setupNewChannel: jest.fn(),
    fromExistingChannel: jest.fn()
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
        decoratedFactoryMock.setupNewChannel.mockResolvedValue({ channelInfo: channelData });

        await systemUnderTest.setupNewChannel({ name: channelData.name });

        expect(CHANNELS_CACHE.get(channelData.name)).toEqual(channelData);
    });

    it("should get channel info from cache if available", async () => {
        const channelData = {
            id: "channelId",
            name: "channelName",
            isArchived: false
        };
        CHANNELS_CACHE.set(channelData.name, channelData);

        const result = await systemUnderTest.fromExistingChannel(channelData.name, true);

        expect((<any>result).channelInfo).toEqual(channelData);
        expect(decoratedFactoryMock.fromExistingChannel).not.toHaveBeenCalled();
    });

    it("should fetch channel info from slack and save in cache", async () => {
        const channelData = {
            id: "channelId",
            name: "channelName",
            isArchived: false
        };
        decoratedFactoryMock.fromExistingChannel.mockResolvedValueOnce({ channelInfo: channelData });
        expect(CHANNELS_CACHE.get(channelData.name)).toBeUndefined();

        const result = await systemUnderTest.fromExistingChannel("channelName", true);

        expect(result.channelInfo).toEqual(channelData);
        expect(CHANNELS_CACHE.get(channelData.name)).toEqual(channelData);
    });
});