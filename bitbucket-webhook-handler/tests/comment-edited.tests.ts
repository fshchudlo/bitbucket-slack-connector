import SlackChannelSnapshottingMock from "../../test-helpers/SlackChannelSnapshottingMock";
import TestPayloadBuilder from "../../test-helpers/TestPayloadBuilder";
import handleBitbucketWebhook from "../handleBitbucketWebhook";
import { TestWebhookHandlerConfig } from "../../test-helpers/TestWebhookHandlerConfig";

describe("handleBitbucketWebhook", () => {

    it("Should send message on PR comment edit", async () => {
        const testSlackGateway = await new SlackChannelSnapshottingMock().setupBasicChannel();
        await handleBitbucketWebhook(TestPayloadBuilder.pullRequestCommentAdded(), testSlackGateway, TestWebhookHandlerConfig);


        const payload = TestPayloadBuilder.pullRequestCommentEdited();
        await handleBitbucketWebhook(payload, testSlackGateway, TestWebhookHandlerConfig);


        expect(testSlackGateway.snapshot).toMatchSnapshot();
    });

    it("Should send message on comment conversion to the task", async () => {
        const testSlackGateway = await new SlackChannelSnapshottingMock().setupBasicChannel();
        await handleBitbucketWebhook(TestPayloadBuilder.pullRequestCommentAdded(), testSlackGateway, TestWebhookHandlerConfig);


        const payload = TestPayloadBuilder.pullRequestCommentConvertedToTheTask();
        await handleBitbucketWebhook(payload, testSlackGateway, TestWebhookHandlerConfig);


        expect(testSlackGateway.snapshot).toMatchSnapshot();
    });

    it("Should send message on task conversion to the comment", async () => {
        const testSlackGateway = await new SlackChannelSnapshottingMock().setupBasicChannel();
        await handleBitbucketWebhook(TestPayloadBuilder.pullRequestTaskAdded(), testSlackGateway, TestWebhookHandlerConfig);


        const payload = TestPayloadBuilder.pullRequestTaskConvertedToTheComment();
        await handleBitbucketWebhook(payload, testSlackGateway, TestWebhookHandlerConfig);


        expect(testSlackGateway.snapshot).toMatchSnapshot();
    });
    it("Should send message on comment resolving and reopening", async () => {
        const testSlackGateway = await new SlackChannelSnapshottingMock().setupBasicChannel();
        await handleBitbucketWebhook(TestPayloadBuilder.pullRequestCommentAdded(), testSlackGateway, TestWebhookHandlerConfig);


        await handleBitbucketWebhook(TestPayloadBuilder.pullRequestCommentResolved(), testSlackGateway, TestWebhookHandlerConfig);
        await handleBitbucketWebhook(TestPayloadBuilder.pullRequestCommentReopened(), testSlackGateway, TestWebhookHandlerConfig);


        expect(testSlackGateway.snapshot).toMatchSnapshot();
    });

    it("Should send message on task resolving and reopening", async () => {
        const testSlackGateway = await new SlackChannelSnapshottingMock().setupBasicChannel();
        await handleBitbucketWebhook(TestPayloadBuilder.pullRequestTaskAdded(), testSlackGateway, TestWebhookHandlerConfig);


        await handleBitbucketWebhook(TestPayloadBuilder.pullRequestTaskResolved(), testSlackGateway, TestWebhookHandlerConfig);
        await handleBitbucketWebhook(TestPayloadBuilder.pullRequestTaskReopened(), testSlackGateway, TestWebhookHandlerConfig);


        expect(testSlackGateway.snapshot).toMatchSnapshot();
    });

    it("Should return generic message if initial comment was not found", async () => {
        const testSlackGateway = await new SlackChannelSnapshottingMock().setupBasicChannel();


        await handleBitbucketWebhook(TestPayloadBuilder.pullRequestTaskReopened(), testSlackGateway, TestWebhookHandlerConfig);


        expect(testSlackGateway.snapshot).toMatchSnapshot();
    });
});
