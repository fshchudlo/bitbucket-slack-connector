import SlackAdapterSnapshottingMock from "./mocks/SlackAdapterSnapshottingMock";
import TestPayloadBuilder from "./mocks/TestPayloadBuilder";
import handleBitbucketWebhook from "../handleBitbucketWebhook";
import { TestBitbucketGateway } from "./mocks/TestBitbucketGateway";
import { TestWebhookHandlerConfig } from "./mocks/TestWebhookHandlerConfig";

describe("handleBitbucketWebhook", () => {
    it("Should send completion message and close the channel on PR deletion", async () => {
        const testSlackGateway = new SlackAdapterSnapshottingMock();
        const payload = TestPayloadBuilder.pullRequestDeleted();

        await handleBitbucketWebhook(payload, testSlackGateway, new TestBitbucketGateway(), TestWebhookHandlerConfig);

        expect(testSlackGateway.snapshot).toMatchSnapshot();
    });

    it("Should send notification to the broadcast channel, if it is specified", async () => {
        const testSlackGateway = new SlackAdapterSnapshottingMock();
        const testConfig = {
            ...TestWebhookHandlerConfig,
            BROADCAST_OPENED_PR_MESSAGES_TO_CHANNEL_ID: "test-broadcast-channel-id"
        };
        await handleBitbucketWebhook(TestPayloadBuilder.pullRequestOpened(), testSlackGateway, new TestBitbucketGateway(), testConfig);


        const payload = TestPayloadBuilder.pullRequestDeleted();
        await handleBitbucketWebhook(payload, testSlackGateway, new TestBitbucketGateway(), testConfig);

        expect(testSlackGateway.snapshot).toMatchSnapshot();
    });
});
