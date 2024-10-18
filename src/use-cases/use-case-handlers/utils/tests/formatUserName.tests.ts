import { formatUserName } from "../formatUserName";

describe("formatUserName", () => {
    it("should return user name as is", () => {
        const testPayload = { name: "John Doe", slackUserId: "12345" };
        const expectedResult = testPayload.name;
        const result = formatUserName(testPayload);
        expect(result).toBe(expectedResult);
    });
});