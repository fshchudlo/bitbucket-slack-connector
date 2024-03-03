import "dotenv/config";
import { App, ExpressReceiver } from "@slack/bolt";
import AppConfig from "./app.config";
import { SlackWebClientGateway } from "./webhook-handler/slack-gateway/SlackWebClientGateway";
import bodyParser from "body-parser";
import handleBitbucketWebhook from "./webhook-handler/handleBitbucketWebhook";

const expressReceiver = new ExpressReceiver({
    signingSecret: AppConfig.SLACK_SIGNING_SECRET
});
const slackApp = new App({
    token: AppConfig.SLACK_BOT_TOKEN,
    receiver: expressReceiver
});
const slackGateway = new SlackWebClientGateway(slackApp.client);

expressReceiver.router.use(bodyParser.json());

expressReceiver.router.post("/bitbucket-webhook", async (req, res) => {
    try {
        await handleBitbucketWebhook(req.body, slackGateway);
        res.sendStatus(200);
    } catch (error) {
        console.error("Error processing webhook:", error);
        res.sendStatus(500);
    }
});


(async () => {
    await slackApp.start(AppConfig.SLACK_BOT_PORT);
    console.log("⚡️ Bolt app is running!");
})();
