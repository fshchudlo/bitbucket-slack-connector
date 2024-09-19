import { formatUserName } from "../formatUserName";

describe("formatUserName", () => {
    it("should return user name by default", () => {
        const testPayload = { name: "John Doe", email: "test@testmail.com" };
        const expectedResult = testPayload.name;
        const result = formatUserName(testPayload);
        expect(result).toBe(expectedResult);
    });

    it("should use email in case of empty name", () => {
        const testPayload = { name: "", email: "test@testmail.com" };
        const expectedResult = testPayload.email;
        const result = formatUserName(testPayload);
        expect(result).toBe(expectedResult);
    });
});