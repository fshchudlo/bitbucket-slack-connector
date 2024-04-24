export function textBlock(text: string, type: string = "mrkdwn") {
    return {
        type: type,
        text: text
    };
}