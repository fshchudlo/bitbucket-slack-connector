import SlackChannelSnapshottingMock from "./test-helpers/SlackChannelSnapshottingMock";
import TestPayloadBuilder from "./test-helpers/TestPayloadBuilder";
import handleWebhookPayload from "../handleWebhookPayload";

describe("handleBitbucketWebhook", () => {

    it("Should send message on PR comment edit", async () => {
        const channelMock = new SlackChannelSnapshottingMock();
        await handleWebhookPayload(TestPayloadBuilder.pullRequestCommentAdded(), channelMock);


        const payload = TestPayloadBuilder.pullRequestCommentEdited();
        await handleWebhookPayload(payload, channelMock);


        expect(channelMock.snapshot).toMatchSnapshot();
    });

    it("Should send message on comment conversion to the task", async () => {
        const channelMock = new SlackChannelSnapshottingMock();
        await handleWebhookPayload(TestPayloadBuilder.pullRequestCommentAdded(), channelMock);


        const payload = TestPayloadBuilder.pullRequestCommentConvertedToTheTask();
        await handleWebhookPayload(payload, channelMock);


        expect(channelMock.snapshot).toMatchSnapshot();
    });

    it("Should send message on task conversion to the comment", async () => {
        const channelMock = new SlackChannelSnapshottingMock();
        await handleWebhookPayload(TestPayloadBuilder.pullRequestTaskAdded(), channelMock);


        const payload = TestPayloadBuilder.pullRequestTaskConvertedToTheComment();
        await handleWebhookPayload(payload, channelMock);


        expect(channelMock.snapshot).toMatchSnapshot();
    });
    it("Should send message on comment resolving and reopening", async () => {
        const channelMock = new SlackChannelSnapshottingMock();
        await handleWebhookPayload(TestPayloadBuilder.pullRequestCommentAdded(), channelMock);


        await handleWebhookPayload(TestPayloadBuilder.pullRequestCommentResolved(), channelMock);
        await handleWebhookPayload(TestPayloadBuilder.pullRequestCommentReopened(), channelMock);


        expect(channelMock.snapshot).toMatchSnapshot();
    });

    it("Should send message on task resolving and reopening", async () => {
        const channelMock = new SlackChannelSnapshottingMock();
        await handleWebhookPayload(TestPayloadBuilder.pullRequestTaskAdded(), channelMock);


        await handleWebhookPayload(TestPayloadBuilder.pullRequestTaskResolved(), channelMock);
        await handleWebhookPayload(TestPayloadBuilder.pullRequestTaskReopened(), channelMock);


        expect(channelMock.snapshot).toMatchSnapshot();
    });

    it("Should return generic message if initial comment was not found", async () => {
        const channelMock = new SlackChannelSnapshottingMock();


        await handleWebhookPayload(TestPayloadBuilder.pullRequestTaskReopened(), channelMock);


        expect(channelMock.snapshot).toMatchSnapshot();
    });
});
