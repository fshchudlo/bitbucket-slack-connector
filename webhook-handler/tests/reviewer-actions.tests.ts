import SlackAdapterSnapshottingMock from "./mocks/SlackAdapterSnapshottingMock";
import TestPayloadBuilder from "./mocks/TestPayloadBuilder";
import handleBitbucketWebhook from "../handleBitbucketWebhook";
import { TestBitbucketGateway } from "./mocks/TestBitbucketGateway";
import { TestWebhookHandlerConfig } from "./mocks/TestWebhookHandlerConfig";

describe("handleBitbucketWebhook", () => {
    it("Should send message on PR approval/unapproval/needs work", async () => {
        const testSlackGateway = await new SlackAdapterSnapshottingMock().setupBasicChannel();


        await handleBitbucketWebhook(TestPayloadBuilder.pullRequestNeedsWork(), testSlackGateway, new TestBitbucketGateway(), TestWebhookHandlerConfig);
        await handleBitbucketWebhook(TestPayloadBuilder.pullRequestUnapproved(), testSlackGateway, new TestBitbucketGateway(), TestWebhookHandlerConfig);
        await handleBitbucketWebhook(TestPayloadBuilder.pullRequestApproved(), testSlackGateway, new TestBitbucketGateway(), TestWebhookHandlerConfig);


        expect(testSlackGateway.snapshot).toMatchSnapshot();
    });
});
