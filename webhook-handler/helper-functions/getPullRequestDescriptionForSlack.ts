import reformatMarkdownToSlackMarkup from "./reformatMarkdownToSlackMarkup";

export default function getPullRequestDescriptionForSlack(pullRequestTitle: string, pullRequestDescription: string, maxSlackMessageLength = 3000): string {
    if (!pullRequestDescription) {
        return pullRequestTitle;
    }
    const reformattedText = reformatMarkdownToSlackMarkup(pullRequestDescription);
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