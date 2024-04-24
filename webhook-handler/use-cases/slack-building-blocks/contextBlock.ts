import { textBlock } from "./textBlock";

export function contextBlock(text: string, type = "mrkdwn") {
    return {
        type: "context",
        elements: [textBlock(text, type)]
    };
}
