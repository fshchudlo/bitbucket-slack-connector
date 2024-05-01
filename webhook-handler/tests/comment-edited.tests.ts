import SlackAdapterSnapshottingMock from "./mocks/SlackAdapterSnapshottingMock";
import TestPayloadBuilder from "./mocks/TestPayloadBuilder";
import handleBitbucketWebhook from "../handleBitbucketWebhook";
import { TestBitbucketGateway } from "./mocks/TestBitbucketGateway";
import { TestWebhookHandlerConfig } from "./mocks/TestWebhookHandlerConfig";

describe("handleBitbucketWebhook", () => {

    it("Should send message on PR comment edit", async () => {
        const testSlackGateway = await new SlackAdapterSnapshottingMock().setupBasicChannel();
        await handleBitbucketWebhook(TestPayloadBuilder.pullRequestCommentAdded(), testSlackGateway, new TestBitbucketGateway(), TestWebhookHandlerConfig);


        const payload = TestPayloadBuilder.pullRequestCommentEdited();
        await handleBitbucketWebhook(payload, testSlackGateway, new TestBitbucketGateway(), TestWebhookHandlerConfig);


        expect(testSlackGateway.snapshot).toMatchSnapshot();
    });

    it("Should send message on comment conversion to the task", async () => {
        const testSlackGateway = await new SlackAdapterSnapshottingMock().setupBasicChannel();
        await handleBitbucketWebhook(TestPayloadBuilder.pullRequestCommentAdded(), testSlackGateway, new TestBitbucketGateway(), TestWebhookHandlerConfig);


        const payload = TestPayloadBuilder.pullRequestCommentConvertedToTheTask();
        await handleBitbucketWebhook(payload, testSlackGateway, new TestBitbucketGateway(), TestWebhookHandlerConfig);


        expect(testSlackGateway.snapshot).toMatchSnapshot();
    });

    it("Should send message on task conversion to the comment", async () => {
        const testSlackGateway = await new SlackAdapterSnapshottingMock().setupBasicChannel();
        await handleBitbucketWebhook(TestPayloadBuilder.pullRequestTaskAdded(), testSlackGateway, new TestBitbucketGateway(), TestWebhookHandlerConfig);


        const payload = TestPayloadBuilder.pullRequestTaskConvertedToTheComment();
        await handleBitbucketWebhook(payload, testSlackGateway, new TestBitbucketGateway(), TestWebhookHandlerConfig);


        expect(testSlackGateway.snapshot).toMatchSnapshot();
    });
    it("Should send message on comment resolving and reopening", async () => {
        const testSlackGateway = await new SlackAdapterSnapshottingMock().setupBasicChannel();
        await handleBitbucketWebhook(TestPayloadBuilder.pullRequestCommentAdded(), testSlackGateway, new TestBitbucketGateway(), TestWebhookHandlerConfig);


        await handleBitbucketWebhook(TestPayloadBuilder.pullRequestCommentResolved(), testSlackGateway, new TestBitbucketGateway(), TestWebhookHandlerConfig);
        await handleBitbucketWebhook(TestPayloadBuilder.pullRequestCommentReopened(), testSlackGateway, new TestBitbucketGateway(), TestWebhookHandlerConfig);


        expect(testSlackGateway.snapshot).toMatchSnapshot();
    });

    it("Should send message on task resolving and reopening", async () => {
        const testSlackGateway = await new SlackAdapterSnapshottingMock().setupBasicChannel();
        await handleBitbucketWebhook(TestPayloadBuilder.pullRequestTaskAdded(), testSlackGateway, new TestBitbucketGateway(), TestWebhookHandlerConfig);


        await handleBitbucketWebhook(TestPayloadBuilder.pullRequestTaskResolved(), testSlackGateway, new TestBitbucketGateway(), TestWebhookHandlerConfig);
        await handleBitbucketWebhook(TestPayloadBuilder.pullRequestTaskReopened(), testSlackGateway, new TestBitbucketGateway(), TestWebhookHandlerConfig);


        expect(testSlackGateway.snapshot).toMatchSnapshot();
    });

    it("Should return generic message if initial comment was not found", async () => {
        const testSlackGateway = await new SlackAdapterSnapshottingMock().setupBasicChannel();


        await handleBitbucketWebhook(TestPayloadBuilder.pullRequestTaskReopened(), testSlackGateway, new TestBitbucketGateway(), TestWebhookHandlerConfig);


        expect(testSlackGateway.snapshot).toMatchSnapshot();
    });
});
