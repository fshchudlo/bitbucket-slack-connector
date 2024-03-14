import { formatUserName } from "../formatUserName";

describe("formatUserName", () => {
    it("should return text wrapped in a Slack bold formatting", () => {
        const testPayload = { displayName: "Test User", emailAddress: "test@testmail.com" };
        const expectedResult = `*${testPayload.displayName}*`;
        const result = formatUserName(testPayload);
        expect(result).toBe(expectedResult);
    });

    it("should handle empty text", () => {
        const testPayload = { displayName: "", emailAddress: "test@testmail.com" };
        const expectedResult = `*${testPayload.emailAddress}*`;
        const result = formatUserName(testPayload);
        expect(result).toBe(expectedResult);
    });
});