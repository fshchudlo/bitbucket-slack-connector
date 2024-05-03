import SlackChannelSnapshottingMock from "../../test-helpers/SlackChannelSnapshottingMock";
import TestPayloadBuilder from "../../test-helpers/TestPayloadBuilder";
import handleBitbucketWebhook from "../handleBitbucketWebhook";

describe("handleBitbucketWebhook", () => {
    it("Should send message on PR comment deletion", async () => {
        const channelMock = new SlackChannelSnapshottingMock();


        await handleBitbucketWebhook(TestPayloadBuilder.pullRequestCommentDeleted(), channelMock);


        expect(channelMock.snapshot).toMatchSnapshot();
    });
});
