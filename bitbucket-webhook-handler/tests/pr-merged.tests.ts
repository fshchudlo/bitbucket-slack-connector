import SlackAdapterSnapshottingMock from "./mocks/SlackAdapterSnapshottingMock";
import TestPayloadBuilder from "./mocks/TestPayloadBuilder";
import handleBitbucketWebhook from "../handleBitbucketWebhook";
import { MockBitbucketAPIAdapter } from "./mocks/MockBitbucketAPIAdapter";
import { TestWebhookHandlerConfig } from "./mocks/TestWebhookHandlerConfig";
import { WebhookHandlerConfig } from "../webhookHandlerConfig";

describe("handleBitbucketWebhook", () => {
    it("Should send completion message and close the channel on PR merge", async () => {
        const testSlackGateway = await new SlackAdapterSnapshottingMock().setupBasicChannel();

        await handleBitbucketWebhook(TestPayloadBuilder.pullRequestMerged(), testSlackGateway, new MockBitbucketAPIAdapter(), TestWebhookHandlerConfig);

        expect(testSlackGateway.snapshot).toMatchSnapshot();
    });

    it("Should send notification to the broadcast channel, if it is specified", async () => {
        const testConfig:WebhookHandlerConfig = {
            ...TestWebhookHandlerConfig,
            getOpenedPRBroadcastChannelId: () => "test-broadcast-channel-id"
        };
        const testSlackGateway = await new SlackAdapterSnapshottingMock().setupBasicChannel(testConfig);


        await handleBitbucketWebhook(TestPayloadBuilder.pullRequestMerged(), testSlackGateway, new MockBitbucketAPIAdapter(), testConfig);


        expect(testSlackGateway.snapshot).toMatchSnapshot();
    });

});
