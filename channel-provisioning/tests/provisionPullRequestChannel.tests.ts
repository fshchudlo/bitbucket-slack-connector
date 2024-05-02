import SlackAdapterSnapshottingMock from "../../test-helpers/SlackAdapterSnapshottingMock";
import { provisionPullRequestChannel } from "../provisionPullRequestChannel";
import { TestWebhookHandlerConfig } from "../../test-helpers/TestWebhookHandlerConfig";
import TestPayloadBuilder from "../../test-helpers/TestPayloadBuilder";

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
