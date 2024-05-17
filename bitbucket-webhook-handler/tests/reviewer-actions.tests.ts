import SlackChannelSnapshottingMock from "../../test-helpers/SlackChannelSnapshottingMock";
import TestPayloadBuilder from "../../test-helpers/TestPayloadBuilder";
import handleWebhookPayload from "../handleWebhookPayload";

describe("handleBitbucketWebhook", () => {
    it("Should send message on PR approval/unapproval/needs work", async () => {
        const channelMock = new SlackChannelSnapshottingMock();


        await handleWebhookPayload(TestPayloadBuilder.pullRequestNeedsWork(), channelMock);
        await handleWebhookPayload(TestPayloadBuilder.pullRequestUnapproved(), channelMock);
        await handleWebhookPayload(TestPayloadBuilder.pullRequestApproved(), channelMock);


        expect(channelMock.snapshot).toMatchSnapshot();
    });
});
