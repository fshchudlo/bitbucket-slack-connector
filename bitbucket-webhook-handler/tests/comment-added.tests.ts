import SlackAdapterSnapshottingMock from "../../test-helpers/SlackAdapterSnapshottingMock";
import TestPayloadBuilder from "../../test-helpers/TestPayloadBuilder";
import handleBitbucketWebhook from "../handleBitbucketWebhook";
import { TestWebhookHandlerConfig } from "../../test-helpers/TestWebhookHandlerConfig";

describe("handleBitbucketWebhook", () => {
    it("Should send message on PR comment", async () => {
        const testSlackGateway = await new SlackAdapterSnapshottingMock().setupBasicChannel();


        await handleBitbucketWebhook(TestPayloadBuilder.pullRequestCommentAdded(), testSlackGateway, testSlackGateway.testChannel, TestWebhookHandlerConfig);


        expect(testSlackGateway.snapshot).toMatchSnapshot();
    });

    it("Should send message on PR task", async () => {
        const testSlackGateway = await new SlackAdapterSnapshottingMock().setupBasicChannel();


        await handleBitbucketWebhook(TestPayloadBuilder.pullRequestTaskAdded(), testSlackGateway, testSlackGateway.testChannel, TestWebhookHandlerConfig);


        expect(testSlackGateway.snapshot).toMatchSnapshot();
    });
});
