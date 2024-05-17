export function section(text: string, type: string = "mrkdwn") {
    return {
        type: "section",
        text: {
            type: type,
            text: text
        }
    };
}
