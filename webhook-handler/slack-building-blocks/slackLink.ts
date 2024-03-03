export function slackLink(url: string, text: string = url) {
    return `<${url}|${text}>`;
}
