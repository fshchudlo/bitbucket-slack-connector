import { link } from "../link";

describe("slackLink", () => {
    it("should return a Slack-formatted link", () => {
        const url = "https://example.com";
        const text = "Example Link";
        const expected = "<https://example.com|Example Link>";
        const result = link(url, text);
        expect(result).toBe(expected);
    });

    it("should return a Slack-formatted link with default text if text is not provided", () => {
        const url = "https://example.com";
        const expected = "<https://example.com|https://example.com>";
        const result = link(url);
        expect(result).toBe(expected);
    });
});

