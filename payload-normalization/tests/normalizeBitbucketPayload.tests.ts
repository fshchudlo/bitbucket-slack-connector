import { PullRequestBasicNotification } from "../../types/bitbucket-payload-types";
import TestPayloadBuilder from "../../bitbucket-webhook-handler/tests/test-helpers/TestPayloadBuilder";
import { normalizeBitbucketPayload } from "../normalizeBitbucketPayload";

describe("normalizeBitbucketPayload", () => {
    it("Should throw Error on unknown action type", async () => {
        expect.assertions(1);

        const invalidPayload = ({
            ...TestPayloadBuilder.reviewersUpdated(),
            eventKey: "unknown action"
        } as unknown) as PullRequestBasicNotification;

        try {
            await normalizeBitbucketPayload(invalidPayload, null);
        } catch (error) {
            expect((error as Error).message).toBe("\"unknown action\" event key is unknown.");
        }
    });
});
