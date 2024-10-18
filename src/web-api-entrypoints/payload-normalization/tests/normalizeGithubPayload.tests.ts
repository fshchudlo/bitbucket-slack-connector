import { normalizeGithubPayload } from "../normalizeGithubPayload";

describe("normalizeGithubPayload.tests", () => {
    it("Should throw Error on unknown action type", async () => {
        expect.assertions(1);

        try {
            await normalizeGithubPayload({
                action: "unknown action"
            } as any, null);
        } catch (error) {
            expect((error as Error).message).toBe("\"unknown action\" action key is unknown.");
        }
    });
});
