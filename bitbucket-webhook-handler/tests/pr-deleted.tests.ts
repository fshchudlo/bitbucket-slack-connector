import SlackAdapterSnapshottingMock from "../../test-helpers/SlackAdapterSnapshottingMock";
import TestPayloadBuilder from "../../test-helpers/TestPayloadBuilder";
import handleBitbucketWebhook from "../handleBitbucketWebhook";
import { TestWebhookHandlerConfig } from "../../test-helpers/TestWebhookHandlerConfig";
import { WebhookHandlerConfig } from "../webhookHandlerConfig";

describe("handleBitbucketWebhook", () => {
    it("Should send completion message and close the channel on PR deletion", async () => {
        const testSlackGateway = await new SlackAdapterSnapshottingMock().setupBasicChannel();
        const payload = TestPayloadBuilder.pullRequestDeleted();


        await handleBitbucketWebhook(payload, testSlackGateway, testSlackGateway.testChannel, TestWebhookHandlerConfig);


        expect(testSlackGateway.snapshot).toMatchSnapshot();
    });

    it("Should send notification to the broadcast channel, if it is specified", async () => {
        const testConfig: WebhookHandlerConfig = {
            ...TestWebhookHandlerConfig,
            getOpenedPRBroadcastChannelId: () => "test-broadcast-channel-id"
        };
        const testSlackGateway = await new SlackAdapterSnapshottingMock().setupBasicChannel(testConfig);


        const payload = TestPayloadBuilder.pullRequestDeleted();
        await handleBitbucketWebhook(payload, testSlackGateway, testSlackGateway.testChannel, testConfig);


        expect(testSlackGateway.snapshot).toMatchSnapshot();
    });
});
