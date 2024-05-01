import SlackAdapterSnapshottingMock from "./mocks/SlackAdapterSnapshottingMock";
import TestPayloadBuilder from "./mocks/TestPayloadBuilder";
import handleBitbucketWebhook from "../handleBitbucketWebhook";
import { MockBitbucketAPIAdapter } from "./mocks/MockBitbucketAPIAdapter";
import { TestWebhookHandlerConfig } from "./mocks/TestWebhookHandlerConfig";

describe("handleBitbucketWebhook", () => {
    it("Should create channel, add bookmark and invite author and reviewers on PR opened", async () => {
        const testSlackGateway = new SlackAdapterSnapshottingMock();


        await handleBitbucketWebhook(TestPayloadBuilder.pullRequestOpened(), testSlackGateway, new MockBitbucketAPIAdapter(), TestWebhookHandlerConfig);


        expect(testSlackGateway.snapshot).toMatchSnapshot();
    });

    it("Should send notification to the broadcast channel, if it is specified", async () => {
        const testSlackGateway = new SlackAdapterSnapshottingMock();
        // noinspection JSUnusedGlobalSymbols
        const testConfig = {
            ...TestWebhookHandlerConfig,
            getOpenedPRBroadcastChannelId: () => "test-broadcast-channel-id"
        };


        await handleBitbucketWebhook(TestPayloadBuilder.pullRequestOpened(), testSlackGateway, new MockBitbucketAPIAdapter(), testConfig);


        expect(testSlackGateway.snapshot).toMatchSnapshot();
    });

});
