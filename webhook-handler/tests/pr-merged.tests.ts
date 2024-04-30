import SlackAdapterSnapshottingMock from "./mocks/SlackAdapterSnapshottingMock";
import TestPayloadBuilder from "./mocks/TestPayloadBuilder";
import handleBitbucketWebhook from "../handleBitbucketWebhook";
import { TestBitbucketGateway } from "./mocks/TestBitbucketGateway";
import { TestWebhookHandlerConfig } from "./mocks/TestWebhookHandlerConfig";
import { WebhookHandlerConfig } from "../webhookHandlerConfig";

describe("handleBitbucketWebhook", () => {
    it("Should send completion message and close the channel on PR merge", async () => {
        const testSlackGateway = new SlackAdapterSnapshottingMock();
        const payload = TestPayloadBuilder.pullRequestMerged();

        await handleBitbucketWebhook(payload, testSlackGateway, new TestBitbucketGateway(), TestWebhookHandlerConfig);

        expect(testSlackGateway.snapshot).toMatchSnapshot();
    });

    it("Should send notification to the broadcast channel, if it is specified", async () => {
        const testSlackGateway = new SlackAdapterSnapshottingMock();
        const testConfig:WebhookHandlerConfig = {
            ...TestWebhookHandlerConfig,
            getOpenedPRBroadcastChannelId: () => "test-broadcast-channel-id"
        };
        await handleBitbucketWebhook(TestPayloadBuilder.pullRequestOpened(), testSlackGateway, new TestBitbucketGateway(), testConfig);


        const payload = TestPayloadBuilder.pullRequestMerged();
        await handleBitbucketWebhook(payload, testSlackGateway, new TestBitbucketGateway(), testConfig);

        expect(testSlackGateway.snapshot).toMatchSnapshot();
    });

});
