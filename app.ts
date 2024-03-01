import "dotenv/config";
import { App, ExpressReceiver } from "@slack/bolt";
import {
    createChannelAndInviteParticipants
} from "./webhook-handlers/pull-request-created/createChannelAndInviteParticipants";
import AppConfig from "./app.config";
import { RealSlackGateway } from "./RealSlackGateway";
import bodyParser from "body-parser";
import {
    sendCompletionMessageAndCloseTheChannel
} from "./webhook-handlers/pull-request-merged-deleted-declined/sendCompletionMessageAndCloseTheChannel";

// Set up Slack App
const expressReceiver = new ExpressReceiver({
    signingSecret: AppConfig.SLACK_SIGNING_SECRET
});
const app = new App({
    token: AppConfig.SLACK_BOT_TOKEN,
    receiver: expressReceiver
});
const slackGateway = new RealSlackGateway(app.client);

expressReceiver.router.use(bodyParser.json());

// Handle incoming webhooks from Bitbucket
expressReceiver.router.post("/bitbucket-webhook", async (req, res) => {
    const eventType = req.body.eventKey;

    try {
        switch (eventType) {
            case "pr:opened":
                await createChannelAndInviteParticipants(req.body, slackGateway);
                break;
            case "pr:merged":
            case "pr:declined":
            case "pr:deleted":
                await sendCompletionMessageAndCloseTheChannel(req.body, slackGateway);
                break;
        }
        res.sendStatus(200);
    } catch (error) {
        console.error("Error processing webhook:", error);
        res.sendStatus(500);
    }
});


(async () => {
    await app.start(AppConfig.SLACK_BOT_PORT);
    console.log("⚡️ Bolt app is running!");
})();

export { app, expressReceiver };
