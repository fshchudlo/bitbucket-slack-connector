export default function reformatMarkdownToSlackMarkup(text: string): string {
    const boldRegex = /\*\*(.*?)\*\*/g;
    const strikethroughRegex = /~~(.*?)~~/g;
    const linkRegex = /\[([^\]]+)]\(([^)]+)\)/g;
    const headingRegex = /^(#+)\s+(.*)$/gm;

    return text
        .replace(boldRegex, (_match, text) => `*${text}*`)
        .replace(strikethroughRegex, (_match, text) => `~${text}~`)
        .replace(linkRegex, (_match, title, url) => `<${url}|${title}>`)
        .replace(headingRegex, (_match, _hashes, text) => `*${text}*`);
}