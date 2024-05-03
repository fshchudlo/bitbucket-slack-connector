import SlackChannelSnapshottingMock from "../../test-helpers/SlackChannelSnapshottingMock";
import TestPayloadBuilder from "../../test-helpers/TestPayloadBuilder";
import handleBitbucketWebhook from "../handleBitbucketWebhook";

describe("handleBitbucketWebhook", () => {

    it("Should send message on PR comment edit", async () => {
        const channelMock = new SlackChannelSnapshottingMock();
        await handleBitbucketWebhook(TestPayloadBuilder.pullRequestCommentAdded(), channelMock);


        const payload = TestPayloadBuilder.pullRequestCommentEdited();
        await handleBitbucketWebhook(payload, channelMock);


        expect(channelMock.snapshot).toMatchSnapshot();
    });

    it("Should send message on comment conversion to the task", async () => {
        const channelMock = new SlackChannelSnapshottingMock();
        await handleBitbucketWebhook(TestPayloadBuilder.pullRequestCommentAdded(), channelMock);


        const payload = TestPayloadBuilder.pullRequestCommentConvertedToTheTask();
        await handleBitbucketWebhook(payload, channelMock);


        expect(channelMock.snapshot).toMatchSnapshot();
    });

    it("Should send message on task conversion to the comment", async () => {
        const channelMock = new SlackChannelSnapshottingMock();
        await handleBitbucketWebhook(TestPayloadBuilder.pullRequestTaskAdded(), channelMock);


        const payload = TestPayloadBuilder.pullRequestTaskConvertedToTheComment();
        await handleBitbucketWebhook(payload, channelMock);


        expect(channelMock.snapshot).toMatchSnapshot();
    });
    it("Should send message on comment resolving and reopening", async () => {
        const channelMock = new SlackChannelSnapshottingMock();
        await handleBitbucketWebhook(TestPayloadBuilder.pullRequestCommentAdded(), channelMock);


        await handleBitbucketWebhook(TestPayloadBuilder.pullRequestCommentResolved(), channelMock);
        await handleBitbucketWebhook(TestPayloadBuilder.pullRequestCommentReopened(), channelMock);


        expect(channelMock.snapshot).toMatchSnapshot();
    });

    it("Should send message on task resolving and reopening", async () => {
        const channelMock = new SlackChannelSnapshottingMock();
        await handleBitbucketWebhook(TestPayloadBuilder.pullRequestTaskAdded(), channelMock);


        await handleBitbucketWebhook(TestPayloadBuilder.pullRequestTaskResolved(), channelMock);
        await handleBitbucketWebhook(TestPayloadBuilder.pullRequestTaskReopened(), channelMock);


        expect(channelMock.snapshot).toMatchSnapshot();
    });

    it("Should return generic message if initial comment was not found", async () => {
        const channelMock = new SlackChannelSnapshottingMock();


        await handleBitbucketWebhook(TestPayloadBuilder.pullRequestTaskReopened(), channelMock);


        expect(channelMock.snapshot).toMatchSnapshot();
    });
});
