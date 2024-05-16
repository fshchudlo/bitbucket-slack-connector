import SlackChannelSnapshottingMock from "../../test-helpers/SlackChannelSnapshottingMock";
import TestPayloadBuilder from "../../test-helpers/TestPayloadBuilder";
import sendTargetNotificationToSlack from "../sendTargetNotificationToSlack";

describe("handleBitbucketWebhook", () => {

    it("Should send message on PR comment edit", async () => {
        const channelMock = new SlackChannelSnapshottingMock();
        await sendTargetNotificationToSlack(TestPayloadBuilder.pullRequestCommentAdded(), channelMock);


        const payload = TestPayloadBuilder.pullRequestCommentEdited();
        await sendTargetNotificationToSlack(payload, channelMock);


        expect(channelMock.snapshot).toMatchSnapshot();
    });

    it("Should send message on comment conversion to the task", async () => {
        const channelMock = new SlackChannelSnapshottingMock();
        await sendTargetNotificationToSlack(TestPayloadBuilder.pullRequestCommentAdded(), channelMock);


        const payload = TestPayloadBuilder.pullRequestCommentConvertedToTheTask();
        await sendTargetNotificationToSlack(payload, channelMock);


        expect(channelMock.snapshot).toMatchSnapshot();
    });

    it("Should send message on task conversion to the comment", async () => {
        const channelMock = new SlackChannelSnapshottingMock();
        await sendTargetNotificationToSlack(TestPayloadBuilder.pullRequestTaskAdded(), channelMock);


        const payload = TestPayloadBuilder.pullRequestTaskConvertedToTheComment();
        await sendTargetNotificationToSlack(payload, channelMock);


        expect(channelMock.snapshot).toMatchSnapshot();
    });
    it("Should send message on comment resolving and reopening", async () => {
        const channelMock = new SlackChannelSnapshottingMock();
        await sendTargetNotificationToSlack(TestPayloadBuilder.pullRequestCommentAdded(), channelMock);


        await sendTargetNotificationToSlack(TestPayloadBuilder.pullRequestCommentResolved(), channelMock);
        await sendTargetNotificationToSlack(TestPayloadBuilder.pullRequestCommentReopened(), channelMock);


        expect(channelMock.snapshot).toMatchSnapshot();
    });

    it("Should send message on task resolving and reopening", async () => {
        const channelMock = new SlackChannelSnapshottingMock();
        await sendTargetNotificationToSlack(TestPayloadBuilder.pullRequestTaskAdded(), channelMock);


        await sendTargetNotificationToSlack(TestPayloadBuilder.pullRequestTaskResolved(), channelMock);
        await sendTargetNotificationToSlack(TestPayloadBuilder.pullRequestTaskReopened(), channelMock);


        expect(channelMock.snapshot).toMatchSnapshot();
    });

    it("Should return generic message if initial comment was not found", async () => {
        const channelMock = new SlackChannelSnapshottingMock();


        await sendTargetNotificationToSlack(TestPayloadBuilder.pullRequestTaskReopened(), channelMock);


        expect(channelMock.snapshot).toMatchSnapshot();
    });
});
