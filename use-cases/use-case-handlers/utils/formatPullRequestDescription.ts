import { markdownToSlackMarkup } from "./markdownToSlackMarkup";

export function formatPullRequestDescription(text: string, maxMessageLength = 3000): string {
    const reformattedText = markdownToSlackMarkup(text);
    if (reformattedText.length < maxMessageLength) {
        return reformattedText;
    }
    const trimmedText = reformattedText.substring(0, maxMessageLength);
    const lastNewLineIndex = trimmedText.lastIndexOf("\n");
    if (lastNewLineIndex != -1) {
        return trimmedText.substring(0, lastNewLineIndex);
    }
    return trimmedText;
}