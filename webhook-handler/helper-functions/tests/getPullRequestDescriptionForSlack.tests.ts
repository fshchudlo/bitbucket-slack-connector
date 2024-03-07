import getPullRequestDescriptionForSlack from "../getPullRequestDescriptionForSlack";

describe("getPullRequestDescriptionForSlack", () => {
    it("reformat markdown to slack markup if description is not empty", () => {
        const result = getPullRequestDescriptionForSlack("# Description\nSome text");
        expect(result).toBe("*Description*\n\n\nSome text");
    });

    it("trims text if length exceeds max Slack message length", () => {
        const longDescription = "a".repeat(40);
        const result = getPullRequestDescriptionForSlack(longDescription, 30);
        expect(result).toBe("a".repeat(30));
    });

    it("cuts text to latest newline to prevent markup spoiling if text length exceeds max Slack message length", () => {
        const longDescription = 'abc\nabc\nabc\n';
        const result = getPullRequestDescriptionForSlack( longDescription, 10);
        expect(result).toBe('abc\nabc');
    });
});