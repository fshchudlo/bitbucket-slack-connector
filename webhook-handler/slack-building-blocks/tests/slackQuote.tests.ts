import { slackQuote } from "../slackQuote";

describe("slackQuote", () => {
    it("should return text wrapped in a Slack quote block", () => {
        const text = "This is a quote";
        const expectedResult = "> This is a quote";
        const result = slackQuote(text);
        expect(result).toBe(expectedResult);
    });

    it("should handle empty text", () => {
        const text = "";
        const expectedResult = "> ";
        const result = slackQuote(text);
        expect(result).toBe(expectedResult);
    });

    it("should handle text with line breaks", () => {
        const text = "Line 1\nLine 2";
        const expectedResult = "> Line 1\nLine 2";
        const result = slackQuote(text);
        expect(result).toBe(expectedResult);
    });
});