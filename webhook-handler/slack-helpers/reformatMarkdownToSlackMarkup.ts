import { bold, link } from "./index";

export function reformatMarkdownToSlackMarkup(text: string): string {
    const boldRegex = /\*\*(.*?)\*\*/g;
    const strikethroughRegex = /~~(.*?)~~/g;
    const linkRegex = /\[([^\]]+)]\(([^)]+)\)/g;
    const headingRegex = /^(#+)\s+(.*)$/gm;

    return text
        .replace(boldRegex, (_match, text) => bold(text))
        .replace(strikethroughRegex, (_match, text) => `~${text}~`)
        .replace(linkRegex, (_match, title, url) => link(url, title))
        .replace(headingRegex, (_match, _hashes, text) => `${bold(text)}\n\n`);
}
