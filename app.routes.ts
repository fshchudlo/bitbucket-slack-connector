import handleBitbucketWebhook from "./webhook-handler/handleBitbucketWebhook";
import appConfig from "./app.config";
import { register } from "prom-client";
import { buildChannelName } from "./webhook-handler/slack-building-blocks";
import util from "util";
import { SlackGateway } from "./webhook-handler/SlackGateway";
import { ExpressReceiver } from "@slack/bolt";
import { SlackGatewayCachedDecorator } from "./gateways/SlackGatewayCachedDecorator";
import BitbucketWebAPIGateway from "./gateways/BitbucketWebAPIGateway";
import AppConfig from "./app.config";

const bitbucketGateway = new BitbucketWebAPIGateway(AppConfig.BITBUCKET_BASE_URL, AppConfig.BITBUCKET_API_TOKEN);
export default function configureRoutes(expressReceiver: ExpressReceiver, slackGateway: SlackGatewayCachedDecorator) {

    expressReceiver.router.post("/bitbucket-webhook", async (req, res) => {
        try {
            await handleBitbucketWebhook(req.body, slackGateway, bitbucketGateway, appConfig.USE_PRIVATE_CHANNELS);
            res.sendStatus(200);
        } catch (error) {
            await handleWebhookError(error, req.body, slackGateway);
            res.sendStatus(500);
        }
    });

    expressReceiver.router.get("/metrics", async (req, res) => {
        res.set("Content-Type", register.contentType);
        res.end(await register.metrics());
    });

    expressReceiver.router.get("/slack-channel", async (req, res) => {
        try {
            const channelName = buildChannelName({
                pullRequestId: req.query.pullRequestId as string,
                repositorySlug: req.query.repositorySlug as string,
                projectKey: req.query.projectKey as string
            });
            const channelInfo = await slackGateway.getChannelInfo(channelName, false);
            res.send(channelInfo);
        } catch (error) {
            await handleWebhookError(error, req.body, slackGateway);
            res.sendStatus(500);
        }
    });

}

async function handleWebhookError(error: any, requestBody: any, slackGateway: SlackGateway) {
    const errorMessage = ["Error processing webhook.", `Error: ${util.inspect(error, true, 8)}.`, `Payload: ${util.inspect(requestBody, true, 8)}`].join("\n\n");
    console.error(errorMessage);
    try {
        if (appConfig.DIAGNOSTIC_CHANNEL) {
            await slackGateway.sendMessage({
                channel: appConfig.DIAGNOSTIC_CHANNEL,
                text: errorMessage
            });
        }
    } catch (error) {
        console.error("Error during sending message to the diagnostic channel", error);
    }
}
