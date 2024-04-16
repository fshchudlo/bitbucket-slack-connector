import { slackBold } from "../slackBold";

describe("slackBold", () => {
    it("should return text wrapped in a Slack bold formatting", () => {
        const text = "This is a bold text";
        const expectedResult = "*This is a bold text*";
        const result = slackBold(text);
        expect(result).toBe(expectedResult);
    });

    it("should handle empty text", () => {
        const text = "";
        const expectedResult = "";
        const result = slackBold(text);
        expect(result).toBe(expectedResult);
    });

    it("should handle text with line breaks", () => {
        const text = "Line 1\nLine 2";
        const expectedResult = "*Line 1\nLine 2*";
        const result = slackBold(text);
        expect(result).toBe(expectedResult);
    });
});