import SlackChannelSnapshottingMock from "../../test-helpers/SlackChannelSnapshottingMock";
import TestPayloadBuilder from "../../test-helpers/TestPayloadBuilder";
import sendTargetNotificationToSlack from "../handleBitbucketWebhook";

describe("handleBitbucketWebhook", () => {
    it("Should send message on PR comment deletion", async () => {
        const channelMock = new SlackChannelSnapshottingMock();


        await sendTargetNotificationToSlack(TestPayloadBuilder.pullRequestCommentDeleted(), channelMock);


        expect(channelMock.snapshot).toMatchSnapshot();
    });
});
