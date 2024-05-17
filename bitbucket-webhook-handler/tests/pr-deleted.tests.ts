import SlackChannelSnapshottingMock from "../../test-helpers/SlackChannelSnapshottingMock";
import TestPayloadBuilder from "../../test-helpers/TestPayloadBuilder";
import handleWebhookPayload from "../handleWebhookPayload";

describe("handleBitbucketWebhook", () => {
    it("Should send completion message and close the channel on PR deletion", async () => {
        const channelMock = new SlackChannelSnapshottingMock();
        const payload = TestPayloadBuilder.pullRequestDeleted();


        await handleWebhookPayload(payload, channelMock);


        expect(channelMock.snapshot).toMatchSnapshot();
    });

    it("Should send notification to the broadcast channel, if it is specified", async () => {
        const channelMock = new SlackChannelSnapshottingMock();
        await handleWebhookPayload(TestPayloadBuilder.pullRequestOpened(), channelMock, channelMock);

        await handleWebhookPayload(TestPayloadBuilder.pullRequestDeleted(), channelMock, channelMock);


        expect(channelMock.snapshot).toMatchSnapshot();
    });
});
