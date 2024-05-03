import SlackChannelSnapshottingMock from "../../test-helpers/SlackChannelSnapshottingMock";
import TestPayloadBuilder from "../../test-helpers/TestPayloadBuilder";
import handleBitbucketWebhook from "../handleBitbucketWebhook";

describe("handleBitbucketWebhook", () => {
    it("Should send message on PR approval/unapproval/needs work", async () => {
        const channelMock = new SlackChannelSnapshottingMock();


        await handleBitbucketWebhook(TestPayloadBuilder.pullRequestNeedsWork(), channelMock);
        await handleBitbucketWebhook(TestPayloadBuilder.pullRequestUnapproved(), channelMock);
        await handleBitbucketWebhook(TestPayloadBuilder.pullRequestApproved(), channelMock);


        expect(channelMock.snapshot).toMatchSnapshot();
    });
});
