import SlackAdapterSnapshottingMock from "./mocks/SlackAdapterSnapshottingMock";
import handleBitbucketWebhook from "../handleBitbucketWebhook";
import { TestBitbucketGateway } from "./mocks/TestBitbucketGateway";
import { PullRequestBasicNotification } from "../../typings";
import TestPayloadBuilder from "./mocks/TestPayloadBuilder";
import AppConfig from "../../app.config";

describe("handleBitbucketWebhook", () => {
    it("Should throw Error on unknown action type", async () => {
        expect.assertions(1);

        const invalidPayload = ({
            ...TestPayloadBuilder.reviewersUpdated(),
            eventKey: "unknown action"
        } as unknown) as PullRequestBasicNotification;

        try {
            await handleBitbucketWebhook(invalidPayload, new SlackAdapterSnapshottingMock(), new TestBitbucketGateway(), AppConfig);
        } catch (error) {
            expect((error as Error).message).toBe("\"unknown action\" event key is unknown.");
        }
    });
});
