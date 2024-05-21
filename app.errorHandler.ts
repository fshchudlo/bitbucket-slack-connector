import { AppConfig } from "./app.config";
import util from "util";
import express, { NextFunction } from "express";
import { WebClient } from "@slack/web-api";

export default async function logUnhandledError(error: any, req: express.Request, res: express.Response, next: NextFunction, slackWebClient: WebClient) {
    const errorMessage = ["Error processing webhook.", `Error: ${util.inspect(error, false, 8)}.`, `Payload: ${util.inspect(req.body, false, 8)}`].join("\n\n");
    console.error(errorMessage);
    try {
        if (AppConfig.DIAGNOSTIC_CHANNEL) {
            await slackWebClient.chat.postMessage({
                channel: AppConfig.DIAGNOSTIC_CHANNEL,
                text: errorMessage
            });
        }
    } catch (error) {
        console.error("Error during sending message to the diagnostic channel", error);
    }

    if (res.headersSent) {
        return next(error);
    } else {
        res.sendStatus(500);
    }
}