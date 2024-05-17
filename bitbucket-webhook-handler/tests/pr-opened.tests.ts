import SlackChannelSnapshottingMock from "../../test-helpers/SlackChannelSnapshottingMock";
import TestPayloadBuilder from "../../test-helpers/TestPayloadBuilder";
import handleWebhookPayload from "../handleWebhookPayload";

describe("handleBitbucketWebhook", () => {
    it("Should add bookmark and invite author and reviewers on PR opened", async () => {
        const channelMock = new SlackChannelSnapshottingMock();


        await handleWebhookPayload(TestPayloadBuilder.pullRequestOpened(), channelMock);


        expect(channelMock.snapshot).toMatchSnapshot();
    });

    it("Should send notification to the broadcast channel, if it is specified", async () => {
        const channelMock = new SlackChannelSnapshottingMock();

        await handleWebhookPayload(TestPayloadBuilder.pullRequestOpened(), channelMock, channelMock);


        expect(channelMock.snapshot).toMatchSnapshot();
    });

});
