import SlackChannelSnapshottingMock from "../../test-helpers/SlackChannelSnapshottingMock";
import TestPayloadBuilder from "../../test-helpers/TestPayloadBuilder";
import sendTargetNotificationToSlack from "../handleBitbucketWebhook";

describe("handleBitbucketWebhook", () => {
    it("Should send message on PR approval/unapproval/needs work", async () => {
        const channelMock = new SlackChannelSnapshottingMock();


        await sendTargetNotificationToSlack(TestPayloadBuilder.pullRequestNeedsWork(), channelMock);
        await sendTargetNotificationToSlack(TestPayloadBuilder.pullRequestUnapproved(), channelMock);
        await sendTargetNotificationToSlack(TestPayloadBuilder.pullRequestApproved(), channelMock);


        expect(channelMock.snapshot).toMatchSnapshot();
    });
});
