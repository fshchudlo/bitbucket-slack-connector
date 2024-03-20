import { reformatMarkdownToSlackMarkup } from "./reformatMarkdownToSlackMarkup";

export function getPullRequestDescriptionForSlack(text: string, maxSlackMessageLength = 3000): string {
    const reformattedText = reformatMarkdownToSlackMarkup(text);
    if (reformattedText.length < maxSlackMessageLength) {
        return reformattedText;
    }
    const trimmedText = reformattedText.substring(0, maxSlackMessageLength);
    const lastNewLineIndex = trimmedText.lastIndexOf("\n");
    if (lastNewLineIndex != -1) {
        return trimmedText.substring(0, lastNewLineIndex);
    }
    return trimmedText;
}