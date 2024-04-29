import SlackAdapterSnapshottingMock from "./mocks/SlackAdapterSnapshottingMock";
import TestPayloadBuilder from "./mocks/TestPayloadBuilder";
import handleBitbucketWebhook from "../handleBitbucketWebhook";
import { TestBitbucketGateway } from "./mocks/TestBitbucketGateway";
import { TestWebhookHandlerConfig } from "./mocks/TestWebhookHandlerConfig";

describe("handleBitbucketWebhook", () => {
    it("Should send message on PR commit", async () => {
        const testSlackGateway = new SlackAdapterSnapshottingMock();
        const payload = TestPayloadBuilder.pullRequestFromRefUpdated();
        await handleBitbucketWebhook(payload, testSlackGateway, new TestBitbucketGateway(), TestWebhookHandlerConfig);

        expect(testSlackGateway.snapshot).toMatchSnapshot();
    });
});
