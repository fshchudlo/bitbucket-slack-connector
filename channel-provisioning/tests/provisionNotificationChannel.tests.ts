import { provisionNotificationChannel } from "../provisionNotificationChannel";
import TestPayloadBuilder from "../../test-helpers/TestPayloadBuilder";
import SlackChannelFactorySnapshottingMock from "../../test-helpers/SlackChannelFactorySnapshottingMock";

describe("provisionNotificationChannel", () => {
    it("Should create channel", async () => {
        const testFactory = new SlackChannelFactorySnapshottingMock();

        await provisionNotificationChannel(testFactory, null, TestPayloadBuilder.pullRequestOpened());

        expect(testFactory.snapshot).toMatchSnapshot();
    });

    it("Should replay channel creation if channel doesn't exist and handle initial payload after that", async () => {
        const testFactory = new SlackChannelFactorySnapshottingMock();

        await provisionNotificationChannel(testFactory, null, TestPayloadBuilder.reviewersUpdated());

        expect(testFactory.snapshot).toMatchSnapshot();
    });
});
