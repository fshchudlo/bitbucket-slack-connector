import SlackAdapterSnapshottingMock from "./mocks/SlackAdapterSnapshottingMock";
import TestPayloadBuilder from "./mocks/TestPayloadBuilder";
import handleBitbucketWebhook from "../handleBitbucketWebhook";
import { TestWebhookHandlerConfig } from "./mocks/TestWebhookHandlerConfig";

describe("handleBitbucketWebhook", () => {
    it("Should send message on PR approval/unapproval/needs work", async () => {
        const testSlackGateway = await new SlackAdapterSnapshottingMock().setupBasicChannel();


        await handleBitbucketWebhook(TestPayloadBuilder.pullRequestNeedsWork(), testSlackGateway, testSlackGateway.testChannel, TestWebhookHandlerConfig);
        await handleBitbucketWebhook(TestPayloadBuilder.pullRequestUnapproved(), testSlackGateway, testSlackGateway.testChannel, TestWebhookHandlerConfig);
        await handleBitbucketWebhook(TestPayloadBuilder.pullRequestApproved(), testSlackGateway, testSlackGateway.testChannel, TestWebhookHandlerConfig);


        expect(testSlackGateway.snapshot).toMatchSnapshot();
    });
});
