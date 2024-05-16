import SlackChannelSnapshottingMock from "../../test-helpers/SlackChannelSnapshottingMock";
import TestPayloadBuilder from "../../test-helpers/TestPayloadBuilder";
import sendTargetNotificationToSlack from "../sendTargetNotificationToSlack";

describe("handleBitbucketWebhook", () => {
    it("Should send message on PR comment", async () => {
        const channelMock = new SlackChannelSnapshottingMock();


        await sendTargetNotificationToSlack(TestPayloadBuilder.pullRequestCommentAdded(), channelMock);


        expect(channelMock.snapshot).toMatchSnapshot();
    });

    it("Should send message on PR task", async () => {
        const channelMock = new SlackChannelSnapshottingMock();


        await sendTargetNotificationToSlack(TestPayloadBuilder.pullRequestTaskAdded(), channelMock);


        expect(channelMock.snapshot).toMatchSnapshot();
    });
});
