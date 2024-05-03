import SlackChannelSnapshottingMock from "../../test-helpers/SlackChannelSnapshottingMock";
import TestPayloadBuilder from "../../test-helpers/TestPayloadBuilder";
import handleBitbucketWebhook from "../handleBitbucketWebhook";
import { TestWebhookHandlerConfig } from "../../test-helpers/TestWebhookHandlerConfig";
import { WebhookHandlerConfig } from "../webhookHandlerConfig";

describe("handleBitbucketWebhook", () => {
    it("Should send completion message and close the channel on PR merge", async () => {
        const testSlackGateway = await new SlackChannelSnapshottingMock().setupBasicChannel();

        await handleBitbucketWebhook(TestPayloadBuilder.pullRequestMerged(), testSlackGateway, TestWebhookHandlerConfig);

        expect(testSlackGateway.snapshot).toMatchSnapshot();
    });

    it("Should send notification to the broadcast channel, if it is specified", async () => {
        const testConfig:WebhookHandlerConfig = {
            ...TestWebhookHandlerConfig,
            getOpenedPRBroadcastChannelId: () => "test-broadcast-channel-id"
        };
        const testSlackGateway = await new SlackChannelSnapshottingMock().setupBasicChannel(testConfig);


        await handleBitbucketWebhook(TestPayloadBuilder.pullRequestMerged(), testSlackGateway, testConfig);


        expect(testSlackGateway.snapshot).toMatchSnapshot();
    });

});
