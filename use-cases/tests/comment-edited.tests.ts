import SlackChannelSnapshottingMock from "./test-helpers/SlackChannelSnapshottingMock";
import TestPayloadBuilder from "./test-helpers/TestPayloadBuilder";
import handlePullRequestEvent from "../handlePullRequestEvent";

describe("handleBitbucketWebhook", () => {

    it("Should send message on PR comment edit", async () => {
        const channelMock = new SlackChannelSnapshottingMock();
        await handlePullRequestEvent(TestPayloadBuilder.pullRequestCommentAdded(), channelMock);


        const payload = TestPayloadBuilder.pullRequestCommentEdited();
        await handlePullRequestEvent(payload, channelMock);


        expect(channelMock.snapshot).toMatchSnapshot();
    });

    it("Should send message on comment conversion to the task", async () => {
        const channelMock = new SlackChannelSnapshottingMock();
        await handlePullRequestEvent(TestPayloadBuilder.pullRequestCommentAdded(), channelMock);


        const payload = TestPayloadBuilder.pullRequestCommentConvertedToTheTask();
        await handlePullRequestEvent(payload, channelMock);


        expect(channelMock.snapshot).toMatchSnapshot();
    });

    it("Should send message on task conversion to the comment", async () => {
        const channelMock = new SlackChannelSnapshottingMock();
        await handlePullRequestEvent(TestPayloadBuilder.pullRequestTaskAdded(), channelMock);


        const payload = TestPayloadBuilder.pullRequestTaskConvertedToTheComment();
        await handlePullRequestEvent(payload, channelMock);


        expect(channelMock.snapshot).toMatchSnapshot();
    });
    it("Should send message on comment resolving and reopening", async () => {
        const channelMock = new SlackChannelSnapshottingMock();
        await handlePullRequestEvent(TestPayloadBuilder.pullRequestCommentAdded(), channelMock);


        await handlePullRequestEvent(TestPayloadBuilder.pullRequestCommentResolved(), channelMock);
        await handlePullRequestEvent(TestPayloadBuilder.pullRequestCommentReopened(), channelMock);


        expect(channelMock.snapshot).toMatchSnapshot();
    });

    it("Should send message on task resolving and reopening", async () => {
        const channelMock = new SlackChannelSnapshottingMock();
        await handlePullRequestEvent(TestPayloadBuilder.pullRequestTaskAdded(), channelMock);


        await handlePullRequestEvent(TestPayloadBuilder.pullRequestTaskResolved(), channelMock);
        await handlePullRequestEvent(TestPayloadBuilder.pullRequestTaskReopened(), channelMock);


        expect(channelMock.snapshot).toMatchSnapshot();
    });

    it("Should return generic message if initial comment was not found", async () => {
        const channelMock = new SlackChannelSnapshottingMock();


        await handlePullRequestEvent(TestPayloadBuilder.pullRequestTaskReopened(), channelMock);


        expect(channelMock.snapshot).toMatchSnapshot();
    });
});
