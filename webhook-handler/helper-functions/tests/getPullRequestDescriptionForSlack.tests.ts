import getPullRequestDescriptionForSlack from "../getPullRequestDescriptionForSlack";

describe("getPullRequestDescriptionForSlack", () => {
    it("returns pull request title if description is empty", () => {
        const result = getPullRequestDescriptionForSlack("Test PR", "");
        expect(result).toBe("Test PR");
    });

    it("reformat markdown to slack markup if description is not empty", () => {
        const result = getPullRequestDescriptionForSlack("Test PR", "# Description\nSome text");
        expect(result).toBe("*Description*\n\n\nSome text");
    });

    it("trims text if length exceeds max Slack message length", () => {
        const longDescription = "a".repeat(40);
        const result = getPullRequestDescriptionForSlack("Test PR", longDescription, 30);
        expect(result).toBe("a".repeat(30));
    });

    it("cuts text to latest newline to prevent markup spoiling if text length exceeds max Slack message length", () => {
        const longDescription = `${"a".repeat(10)}\n`.repeat(4);
        const result = getPullRequestDescriptionForSlack("Test PR", longDescription, 30);
        expect(result).toBe(`${"a".repeat(10)}\n${"a".repeat(10)}`);
    });
});