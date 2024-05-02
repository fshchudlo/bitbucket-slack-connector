import SlackAdapterSnapshottingMock from "./mocks/SlackAdapterSnapshottingMock";
import handleBitbucketWebhook from "../handleBitbucketWebhook";
import { PullRequestBasicNotification } from "../../bitbucket-payload-types";
import TestPayloadBuilder from "./mocks/TestPayloadBuilder";
import { TestWebhookHandlerConfig } from "./mocks/TestWebhookHandlerConfig";

describe("handleBitbucketWebhook", () => {
    it("Should throw Error on unknown action type", async () => {
        expect.assertions(1);

        const invalidPayload = ({
            ...TestPayloadBuilder.reviewersUpdated(),
            eventKey: "unknown action"
        } as unknown) as PullRequestBasicNotification;

        try {
            await handleBitbucketWebhook(invalidPayload, new SlackAdapterSnapshottingMock(), TestWebhookHandlerConfig);
        } catch (error) {
            expect((error as Error).message).toBe("\"unknown action\" event key is unknown.");
        }
    });

    it("Should replay channel creation if channel doesn't exist and handle initial payload after that", async () => {
        const testSlackGateway = new SlackAdapterSnapshottingMock();


        await handleBitbucketWebhook(TestPayloadBuilder.reviewersUpdated(), testSlackGateway, TestWebhookHandlerConfig);


        expect(testSlackGateway.snapshot).toMatchSnapshot();
    });
});
