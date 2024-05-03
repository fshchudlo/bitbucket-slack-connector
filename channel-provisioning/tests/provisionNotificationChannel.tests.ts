import { provisionNotificationChannel } from "../provisionNotificationChannel";
import { TestWebhookHandlerConfig } from "../../test-helpers/TestWebhookHandlerConfig";
import TestPayloadBuilder from "../../test-helpers/TestPayloadBuilder";
import SlackChannelFactorySnapshottingMock from "../../test-helpers/SlackChannelFactorySnapshottingMock";

describe("provisionNotificationChannel", () => {
    it("Should create channel", async () => {
        const testFactory = new SlackChannelFactorySnapshottingMock();

        await provisionNotificationChannel(testFactory, TestPayloadBuilder.pullRequestOpened(), TestWebhookHandlerConfig);

        expect(testFactory.snapshot).toMatchSnapshot();
    });

    it("Should replay channel creation if channel doesn't exist and handle initial payload after that", async () => {
        const testFactory = new SlackChannelFactorySnapshottingMock();

        await provisionNotificationChannel(testFactory, TestPayloadBuilder.reviewersUpdated(), TestWebhookHandlerConfig);

        expect(testFactory.snapshot).toMatchSnapshot();
    });
});
