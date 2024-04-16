import SlackAdapterSnapshottingMock from "../SlackAdapterSnapshottingMock";
import handleBitbucketWebhook from "../../handleBitbucketWebhook";
import { TestBitbucketGateway } from "../TestBitbucketGateway";
import { PullRequestBasicNotification } from "../../../typings";

describe("handleBitbucketWebhook", () => {
    it("Should throw Error on unknown action type", async () => {
        expect.assertions(1);

        const invalidPayload = ({ eventKey: "unknown action" } as unknown) as PullRequestBasicNotification;

        try {
            await handleBitbucketWebhook(invalidPayload, new SlackAdapterSnapshottingMock(), new TestBitbucketGateway());
        } catch (error) {
            expect((error as Error).message).toBe("\"unknown action\" event key is unknown.");
        }
    });
});
