import { PullRequestBasicNotification } from "../../bitbucket-payload-types";
import TestPayloadBuilder from "../../test-helpers/TestPayloadBuilder";
import { normalizeBitbucketWebhookPayload } from "../normalizeBitbucketWebhookPayload";

describe("normalizeBitbucketWebhookPayload", () => {
    it("Should throw Error on unknown action type", async () => {
        expect.assertions(1);

        const invalidPayload = ({
            ...TestPayloadBuilder.reviewersUpdated(),
            eventKey: "unknown action"
        } as unknown) as PullRequestBasicNotification;

        try {
            await normalizeBitbucketWebhookPayload(invalidPayload, null);
        } catch (error) {
            expect((error as Error).message).toBe("\"unknown action\" event key is unknown.");
        }
    });
});
