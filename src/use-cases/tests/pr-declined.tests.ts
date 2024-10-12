import SlackChannelSnapshottingMock from "./test-helpers/SlackChannelSnapshottingMock";
import TestPayloadBuilder from "./test-helpers/TestPayloadBuilder";
import handlePullRequestEvent from "../handlePullRequestEvent";

describe("handleBitbucketWebhook", () => {
    it("Should send completion message and close the channel on PR declining", async () => {
        const channelMock = new SlackChannelSnapshottingMock();


        await handlePullRequestEvent(TestPayloadBuilder.pullRequestDeclined(), channelMock);


        expect(channelMock.snapshot).toMatchSnapshot();
    });

    it("Should send notification to the broadcast channel, if it is specified", async () => {
        const channelMock = new SlackChannelSnapshottingMock();
        await handlePullRequestEvent(TestPayloadBuilder.pullRequestOpened(), channelMock, channelMock);

        await handlePullRequestEvent(TestPayloadBuilder.pullRequestDeclined(), channelMock, channelMock);


        expect(channelMock.snapshot).toMatchSnapshot();
    });
});
