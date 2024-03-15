import { formatUserName } from "../formatUserName";

describe("formatUserName", () => {
    it("should return user name by default", () => {
        const testPayload = { displayName: "Test User", emailAddress: "test@testmail.com" };
        const expectedResult = testPayload.displayName;
        const result = formatUserName(testPayload);
        expect(result).toBe(expectedResult);
    });

    it("should use email in case of empty name", () => {
        const testPayload = { displayName: "", emailAddress: "test@testmail.com" };
        const expectedResult = testPayload.emailAddress;
        const result = formatUserName(testPayload);
        expect(result).toBe(expectedResult);
    });
});