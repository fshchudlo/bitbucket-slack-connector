import SlackAdapterSnapshottingMock from "./mocks/SlackAdapterSnapshottingMock";
import handleBitbucketWebhook from "../handleBitbucketWebhook";
import { PullRequestBasicNotification } from "../../bitbucket-payload-types";
import TestPayloadBuilder from "./mocks/TestPayloadBuilder";
import { TestWebhookHandlerConfig } from "./mocks/TestWebhookHandlerConfig";

describe("handleBitbucketWebhook", () => {
    it("Should throw Error on unknown action type", async () => {
        expect.assertions(1);

        const testSlackGateway = new SlackAdapterSnapshottingMock();
        const invalidPayload = ({
            ...TestPayloadBuilder.reviewersUpdated(),
            eventKey: "unknown action"
        } as unknown) as PullRequestBasicNotification;

        try {
            await handleBitbucketWebhook(invalidPayload, testSlackGateway, testSlackGateway.testChannel, TestWebhookHandlerConfig);
        } catch (error) {
            expect((error as Error).message).toBe("\"unknown action\" event key is unknown.");
        }
    });
});
