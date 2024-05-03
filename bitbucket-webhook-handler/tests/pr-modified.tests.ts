import SlackChannelSnapshottingMock from "../../test-helpers/SlackChannelSnapshottingMock";
import TestPayloadBuilder from "../../test-helpers/TestPayloadBuilder";
import handleBitbucketWebhook from "../handleBitbucketWebhook";

describe("handleBitbucketWebhook", () => {
    it("Should send message when PR modified", async () => {
        const channelMock = new SlackChannelSnapshottingMock();


        await handleBitbucketWebhook(TestPayloadBuilder.pullRequestModified(), channelMock);


        expect(channelMock.snapshot).toMatchSnapshot();
    });
    it("Should not send message if PR doesn't contain visible changes", async () => {
        const channelMock = new SlackChannelSnapshottingMock();


        const modifiedPayload = TestPayloadBuilder.pullRequestModifiedWithoutVisibleChanges();
        await handleBitbucketWebhook(modifiedPayload, channelMock);


        expect(channelMock.snapshot).toMatchSnapshot();
    });
});
