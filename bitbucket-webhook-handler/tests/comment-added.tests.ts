import SlackChannelSnapshottingMock from "../../test-helpers/SlackChannelSnapshottingMock";
import TestPayloadBuilder from "../../test-helpers/TestPayloadBuilder";
import handleWebhookPayload from "../handleWebhookPayload";

describe("handleBitbucketWebhook", () => {
    it("Should send message on PR comment", async () => {
        const channelMock = new SlackChannelSnapshottingMock();


        await handleWebhookPayload(TestPayloadBuilder.pullRequestCommentAdded(), channelMock);


        expect(channelMock.snapshot).toMatchSnapshot();
    });

    it("Should send message on PR task", async () => {
        const channelMock = new SlackChannelSnapshottingMock();


        await handleWebhookPayload(TestPayloadBuilder.pullRequestTaskAdded(), channelMock);


        expect(channelMock.snapshot).toMatchSnapshot();
    });
});
