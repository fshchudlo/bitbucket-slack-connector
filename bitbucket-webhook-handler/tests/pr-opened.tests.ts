import SlackAdapterSnapshottingMock from "../../test-helpers/SlackAdapterSnapshottingMock";
import TestPayloadBuilder from "../../test-helpers/TestPayloadBuilder";
import handleBitbucketWebhook from "../handleBitbucketWebhook";
import { TestWebhookHandlerConfig } from "../../test-helpers/TestWebhookHandlerConfig";

describe("handleBitbucketWebhook", () => {
    it("Should add bookmark and invite author and reviewers on PR opened", async () => {
        const testSlackGateway = await new SlackAdapterSnapshottingMock().setupBasicChannel();


        await handleBitbucketWebhook(TestPayloadBuilder.pullRequestOpened(), testSlackGateway, testSlackGateway.testChannel, TestWebhookHandlerConfig);


        expect(testSlackGateway.snapshot).toMatchSnapshot();
    });

    it("Should send notification to the broadcast channel, if it is specified", async () => {
        const testSlackGateway = await new SlackAdapterSnapshottingMock().setupBasicChannel();
        // noinspection JSUnusedGlobalSymbols
        const testConfig = {
            ...TestWebhookHandlerConfig,
            getOpenedPRBroadcastChannelId: () => "test-broadcast-channel-id"
        };


        await handleBitbucketWebhook(TestPayloadBuilder.pullRequestOpened(), testSlackGateway, testSlackGateway.testChannel, testConfig);


        expect(testSlackGateway.snapshot).toMatchSnapshot();
    });

});
