import SlackAdapterSnapshottingMock from "../../bitbucket-webhook-handler/tests/mocks/SlackAdapterSnapshottingMock";
import { provisionPullRequestChannel } from "../provisionPullRequestChannel";
import { TestWebhookHandlerConfig } from "../../bitbucket-webhook-handler/tests/mocks/TestWebhookHandlerConfig";
import TestPayloadBuilder from "../../bitbucket-webhook-handler/tests/mocks/TestPayloadBuilder";

describe("handleBitbucketWebhook", () => {
    it("Should create channel", async () => {
        const testSlackGateway = new SlackAdapterSnapshottingMock();

        await provisionPullRequestChannel(testSlackGateway, testSlackGateway, TestPayloadBuilder.pullRequestOpened(), TestWebhookHandlerConfig);

        expect(testSlackGateway.snapshot).toMatchSnapshot();
    });

    it("Should replay channel creation if channel doesn't exist and handle initial payload after that", async () => {
        const testSlackGateway = new SlackAdapterSnapshottingMock();

        await provisionPullRequestChannel(testSlackGateway, testSlackGateway, TestPayloadBuilder.reviewersUpdated(), TestWebhookHandlerConfig);

        expect(testSlackGateway.snapshot).toMatchSnapshot();
    });
});
