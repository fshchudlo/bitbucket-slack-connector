import { provisionPullRequestChannel } from "../provisionPullRequestChannel";
import TestPayloadBuilder from "../../test-helpers/TestPayloadBuilder";
import SlackChannelFactorySnapshottingMock from "./SlackChannelFactorySnapshottingMock";

describe("provisionPullRequestChannel", () => {
    it("Should create channel", async () => {
        const testFactory = new SlackChannelFactorySnapshottingMock();

        await provisionPullRequestChannel(testFactory, null, TestPayloadBuilder.pullRequestOpened());

        expect(testFactory.snapshot).toMatchSnapshot();
    });

    it("Should replay channel creation if channel doesn't exist and handle initial payload after that", async () => {
        const testFactory = new SlackChannelFactorySnapshottingMock();

        await provisionPullRequestChannel(testFactory, null, TestPayloadBuilder.reviewersUpdated());

        expect(testFactory.snapshot).toMatchSnapshot();
    });
});
