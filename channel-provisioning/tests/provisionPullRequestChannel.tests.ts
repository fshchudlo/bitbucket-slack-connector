import SlackAdapterSnapshottingMock from "../../test-helpers/SlackAdapterSnapshottingMock";
import { provisionNotificationChannel } from "../provisionNotificationChannel";
import { TestWebhookHandlerConfig } from "../../test-helpers/TestWebhookHandlerConfig";
import TestPayloadBuilder from "../../test-helpers/TestPayloadBuilder";

describe("handleBitbucketWebhook", () => {
    it("Should create channel", async () => {
        const testSlackGateway = new SlackAdapterSnapshottingMock();

        await provisionNotificationChannel(testSlackGateway, testSlackGateway, TestPayloadBuilder.pullRequestOpened(), TestWebhookHandlerConfig);

        expect(testSlackGateway.snapshot).toMatchSnapshot();
    });

    it("Should replay channel creation if channel doesn't exist and handle initial payload after that", async () => {
        const testSlackGateway = new SlackAdapterSnapshottingMock();

        await provisionNotificationChannel(testSlackGateway, testSlackGateway, TestPayloadBuilder.reviewersUpdated(), TestWebhookHandlerConfig);

        expect(testSlackGateway.snapshot).toMatchSnapshot();
    });
});
