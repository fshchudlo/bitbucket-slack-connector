import appConfig from "./app.config";
import util from "util";
import { ExpressReceiver } from "@slack/bolt";
import { SlackAPIAdapterCachedDecorator } from "./gateways/SlackAPIAdapterCachedDecorator";
import express, { NextFunction } from "express";

export default function configureErrorHandler(expressReceiver: ExpressReceiver, slackAPI: SlackAPIAdapterCachedDecorator) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    expressReceiver.router.use(async (error: any, req: express.Request, res: express.Response, next: NextFunction) => {
        if (res.headersSent) {
            return next(error)
        }
        const errorMessage = ["Error processing webhook.", `Error: ${util.inspect(error, false, 8)}.`, `Payload: ${util.inspect(req.body, false, 8)}`].join("\n\n");
        console.error(errorMessage);
        try {
            if (appConfig.DIAGNOSTIC_CHANNEL) {
                await slackAPI.sendMessage({
                    channelId: appConfig.DIAGNOSTIC_CHANNEL,
                    text: errorMessage
                });
            }
        } catch (error) {
            console.error("Error during sending message to the diagnostic channel", error);
        }
        res.sendStatus(500);
    });
}
