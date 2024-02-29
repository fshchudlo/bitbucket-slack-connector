import "dotenv/config";
import { App, ExpressReceiver } from "@slack/bolt";
import { createChannelAndInviteParticipants } from "./webhook-handlers/pull-request-created/createChannelAndInviteParticipants";
import AppConfig from "./app.config";
import { RealSlackGateway } from "./RealSlackGateway";

import swaggerJsdoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'

const options = {
  swaggerDefinition: {
    restapi: '3.0.0',
    info: {
      title: 'Bitbucket-slack-connector API',
      version: '1.0.0',
      description: 'Bitbucket-slack-connector API',
    },
    servers: [
      {
        url: 'http://localhost:3000',
      },
    ],
  },
  apis: ['**/*.ts'],
}

const specs = swaggerJsdoc(options)


// Set up Slack App
const expressReceiver = new ExpressReceiver({
    signingSecret: AppConfig.SLACK_SIGNING_SECRET,
});
const app = new App({
    token: AppConfig.SLACK_BOT_TOKEN,
    receiver: expressReceiver,
});

const slackGateway = new RealSlackGateway(app.client);

// Handle incoming webhooks from Bitbucket
expressReceiver.router.post("/bitbucket-webhook", async (req, res) => {
    const eventType = req.body.eventKey;

    try {
        if (eventType === "pr:opened") {
            await createChannelAndInviteParticipants(req.body, slackGateway);
        }
        //pr:merged
        //pr:declined
        //pr:deleted
        res.sendStatus(200);
    } catch (error) {
        console.error("Error processing webhook:", error);
        res.sendStatus(500);
    }
});

expressReceiver.router.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

(async () => {
    await app.start(AppConfig.SLACK_BOT_PORT);
    console.log("⚡️ Bolt app is running!");
})();

export { app, expressReceiver };
