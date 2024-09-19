import { BitbucketPullRequestBasicNotification } from "../../types/bitbucket-payload-types";
import { normalizeBitbucketPayload } from "../normalizeBitbucketPayload";

describe("normalizeBitbucketPayload", () => {
    it("Should throw Error on unknown action type", async () => {
        expect.assertions(1);

        const invalidPayload = ({
            eventKey: "unknown action"
        } as unknown) as BitbucketPullRequestBasicNotification;

        try {
            await normalizeBitbucketPayload(invalidPayload, null);
        } catch (error) {
            expect((error as Error).message).toBe("\"unknown action\" event key is unknown.");
        }
    });
});
