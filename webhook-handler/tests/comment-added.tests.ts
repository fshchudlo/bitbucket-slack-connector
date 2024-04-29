import SlackAdapterSnapshottingMock from "./mocks/SlackAdapterSnapshottingMock";
import TestPayloadBuilder from "./mocks/TestPayloadBuilder";
import handleBitbucketWebhook from "../handleBitbucketWebhook";
import { TestBitbucketGateway } from "./mocks/TestBitbucketGateway";
import { TestWebhookHandlerConfig } from "./mocks/TestWebhookHandlerConfig";

describe("handleBitbucketWebhook", () => {
    it("Should send message on PR comment", async () => {
        const testSlackGateway = new SlackAdapterSnapshottingMock();
        const payload = TestPayloadBuilder.pullRequestCommentAdded();
        await handleBitbucketWebhook(payload, testSlackGateway, new TestBitbucketGateway(), TestWebhookHandlerConfig);

        expect(testSlackGateway.snapshot).toMatchSnapshot();
    });

    it("Should send message on PR task", async () => {
        const testSlackGateway = new SlackAdapterSnapshottingMock();
        const payload = TestPayloadBuilder.pullRequestTaskAdded();
        await handleBitbucketWebhook(payload, testSlackGateway, new TestBitbucketGateway(), TestWebhookHandlerConfig);

        expect(testSlackGateway.snapshot).toMatchSnapshot();
    });
});
