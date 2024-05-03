import SlackChannelSnapshottingMock from "../../test-helpers/SlackChannelSnapshottingMock";
import TestPayloadBuilder from "../../test-helpers/TestPayloadBuilder";
import handleBitbucketWebhook from "../handleBitbucketWebhook";

describe("handleBitbucketWebhook", () => {
    it("Should update channel participants on reviewers list update", async () => {
        const channelMock = new SlackChannelSnapshottingMock();


        await handleBitbucketWebhook(TestPayloadBuilder.reviewersUpdated(), channelMock, null);


        expect(channelMock.snapshot).toMatchSnapshot();
    });
});
