import { section } from "../section";

describe("slackSection", () => {
    it("should return a Slack-formatted section with provided text", () => {
        const text = "This is a test section";
        const expected = {
            type: "section",
            text: {
                type: "mrkdwn",
                text: "This is a test section"
            }
        };
        const result = section(text);
        expect(result).toEqual(expected);
    });

    it("should return a Slack-formatted section with provided text and type", () => {
        const text = "This is another test section";
        const type = "plain_text";
        const expected = {
            type: "section",
            text: {
                type: "plain_text",
                text: "This is another test section"
            }
        };
        const result = section(text, type);
        expect(result).toEqual(expected);
    });
});
