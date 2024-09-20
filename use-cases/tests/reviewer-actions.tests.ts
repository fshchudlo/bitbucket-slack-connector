import SlackChannelSnapshottingMock from "./test-helpers/SlackChannelSnapshottingMock";
import TestPayloadBuilder from "./test-helpers/TestPayloadBuilder";
import handlePullRequestEvent from "../handlePullRequestEvent";

describe("handleBitbucketWebhook", () => {
    it("Should send message on PR approval/unapproval/needs work", async () => {
        const channelMock = new SlackChannelSnapshottingMock();


        await handlePullRequestEvent(TestPayloadBuilder.pullRequestNeedsWork(), channelMock);
        await handlePullRequestEvent(TestPayloadBuilder.pullRequestUnapproved(), channelMock);
        await handlePullRequestEvent(TestPayloadBuilder.pullRequestApproved(), channelMock);


        expect(channelMock.snapshot).toMatchSnapshot();
    });
});
