import reformatMarkdownToSlackMarkup from "../reformatMarkdownToSlackMarkup";

describe("reformatMarkdownToSlackMarkup", () => {
    it("should convert Markdown bolds to Slack bolds", () => {
        const markdownText = "This is **bold** text.";
        const expected = "This is *bold* text.";
        const result = reformatMarkdownToSlackMarkup(markdownText);
        expect(result).toBe(expected);
    });

    it("should keep Markdown italics identical to Slack italics", () => {
        const markdownText = "This is _italic_ text.";
        const expected = "This is _italic_ text.";
        const result = reformatMarkdownToSlackMarkup(markdownText);
        expect(result).toBe(expected);
    });
    it("should keep Markdown codeblocks identical to Slack codeblocks", () => {
        const markdownText = "This is `code block`.";
        const expected = "This is `code block`.";
        const result = reformatMarkdownToSlackMarkup(markdownText);
        expect(result).toBe(expected);
    });

    it("should convert Markdown strikethrough to Slack strikethrough", () => {
        const markdownText = "This is ~~strikethrough~~ text.";
        const expected = "This is ~strikethrough~ text.";
        const result = reformatMarkdownToSlackMarkup(markdownText);
        expect(result).toBe(expected);
    });

    it("should convert Markdown links to Slack links", () => {
        const markdownText = "This is a [link](https://example.com).";
        const expected = "This is a <https://example.com|link>.";
        const result = reformatMarkdownToSlackMarkup(markdownText);
        expect(result).toBe(expected);
    });
    it('converts Markdown headings of any size to Slack bold text', () => {
        const markdownText = '### Heading 1';
        const expected = '*Heading 1*\n\n';
        const result = reformatMarkdownToSlackMarkup(markdownText);
        expect(result).toBe(expected);
    });
});

