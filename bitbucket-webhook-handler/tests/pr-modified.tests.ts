import SlackAdapterSnapshottingMock from "../../test-helpers/SlackAdapterSnapshottingMock";
import TestPayloadBuilder from "../../test-helpers/TestPayloadBuilder";
import handleBitbucketWebhook from "../handleBitbucketWebhook";
import { TestWebhookHandlerConfig } from "../../test-helpers/TestWebhookHandlerConfig";

describe("handleBitbucketWebhook", () => {
    it("Should send message when PR modified", async () => {
        const testSlackGateway = await new SlackAdapterSnapshottingMock().setupBasicChannel();


        await handleBitbucketWebhook(TestPayloadBuilder.pullRequestModified(), testSlackGateway, testSlackGateway.testChannel, TestWebhookHandlerConfig);


        expect(testSlackGateway.snapshot).toMatchSnapshot();
    });
    it("Doesn't send message if PR doesn't contain visible changes", async () => {
        const testSlackGateway = await new SlackAdapterSnapshottingMock().setupBasicChannel();


        const modifiedPayload = TestPayloadBuilder.pullRequestModifiedWithoutVisibleChanges();
        await handleBitbucketWebhook(modifiedPayload, testSlackGateway, testSlackGateway.testChannel, TestWebhookHandlerConfig);


        expect(testSlackGateway.snapshot).toMatchSnapshot();
    });
});
