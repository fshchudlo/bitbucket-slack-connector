import { AppConfig } from "../app.config";
import { WebClient } from "@slack/web-api";

export default async function logErrorMessage(errorMessage: string, slackWebClient: WebClient) {
    console.error(errorMessage);
    try {
        if (AppConfig.DIAGNOSTIC_CHANNEL) {
            await slackWebClient.chat.postMessage({
                channel: AppConfig.DIAGNOSTIC_CHANNEL,
                text: errorMessage
            });
        } else {
            console.warn("Diagnostic channel is not provided");
        }
    } catch (error) {
        console.error("Error during sending message to the diagnostic channel", error);
    }
}