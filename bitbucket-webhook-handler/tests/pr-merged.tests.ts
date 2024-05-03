import SlackChannelSnapshottingMock from "../../test-helpers/SlackChannelSnapshottingMock";
import TestPayloadBuilder from "../../test-helpers/TestPayloadBuilder";
import handleBitbucketWebhook from "../handleBitbucketWebhook";

describe("handleBitbucketWebhook", () => {
    it("Should send completion message and close the channel on PR merge", async () => {
        const channelMock = new SlackChannelSnapshottingMock();

        await handleBitbucketWebhook(TestPayloadBuilder.pullRequestMerged(), channelMock);

        expect(channelMock.snapshot).toMatchSnapshot();
    });

    it("Should send notification to the broadcast channel, if it is specified", async () => {
        const channelMock = new SlackChannelSnapshottingMock();
        await handleBitbucketWebhook(TestPayloadBuilder.pullRequestOpened(), channelMock, channelMock);


        await handleBitbucketWebhook(TestPayloadBuilder.pullRequestMerged(), channelMock, channelMock);


        expect(channelMock.snapshot).toMatchSnapshot();
    });

});
