import SlackAdapterSnapshottingMock from "../../test-helpers/SlackAdapterSnapshottingMock";
import TestPayloadBuilder from "../../test-helpers/TestPayloadBuilder";
import handleBitbucketWebhook from "../handleBitbucketWebhook";
import { TestWebhookHandlerConfig } from "../../test-helpers/TestWebhookHandlerConfig";

describe("handleBitbucketWebhook", () => {
    it("Should send message on PR approval/unapproval/needs work", async () => {
        const testSlackGateway = await new SlackAdapterSnapshottingMock().setupBasicChannel();


        await handleBitbucketWebhook(TestPayloadBuilder.pullRequestNeedsWork(), testSlackGateway, testSlackGateway.testChannel, TestWebhookHandlerConfig);
        await handleBitbucketWebhook(TestPayloadBuilder.pullRequestUnapproved(), testSlackGateway, testSlackGateway.testChannel, TestWebhookHandlerConfig);
        await handleBitbucketWebhook(TestPayloadBuilder.pullRequestApproved(), testSlackGateway, testSlackGateway.testChannel, TestWebhookHandlerConfig);


        expect(testSlackGateway.snapshot).toMatchSnapshot();
    });
});
