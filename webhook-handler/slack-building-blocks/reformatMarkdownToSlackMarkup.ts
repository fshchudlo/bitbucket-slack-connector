import { slackBold, slackLink } from "./index";

export function reformatMarkdownToSlackMarkup(text: string): string {
    const boldRegex = /\*\*(.*?)\*\*/g;
    const strikethroughRegex = /~~(.*?)~~/g;
    const linkRegex = /\[([^\]]+)]\(([^)]+)\)/g;
    const headingRegex = /^(#+)\s+(.*)$/gm;

    return text
        .replace(boldRegex, (_match, text) => slackBold(text))
        .replace(strikethroughRegex, (_match, text) => `~${text}~`)
        .replace(linkRegex, (_match, title, url) => slackLink(url, title))
        .replace(headingRegex, (_match, _hashes, text) => `${slackBold(text)}\n\n`);
}
