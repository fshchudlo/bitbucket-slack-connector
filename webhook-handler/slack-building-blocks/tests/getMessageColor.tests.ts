import { getMessageColor } from "../getMessageColor";
import { PullRequestBasicNotification } from "../../../typings";

describe("getMessageColor", () => {
    it("Should throw Error on unknown action type", async () => {
        expect.assertions(1);

        const invalidPayload = ({ eventKey: "unknown action" } as unknown) as PullRequestBasicNotification;

        try {
            getMessageColor(invalidPayload);
        } catch (error) {
            expect((error as Error).message).toBe("\"unknown action\" event key is unknown.");
        }
    });
});