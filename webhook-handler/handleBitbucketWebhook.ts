import { createChannelAndInviteParticipants } from "./specific-handlers/createChannelAndInviteParticipants";
import { sendCompletionMessageAndCloseTheChannel } from "./specific-handlers/sendCompletionMessageAndCloseTheChannel";
import { sendPRCommentToSlack } from "./specific-handlers/sendPRCommentToSlack";
import { PullRequestBasicPayload, PullRequestCommentAddedPayload } from "./contracts";
import { SlackGateway } from "./slack-gateway/SlackGateway";

type BitbucketPayload = PullRequestBasicPayload | PullRequestCommentAddedPayload;
export default async function handleBitbucketWebhook(payload: BitbucketPayload, slackGateway: SlackGateway) {
    const eventType = payload.eventKey;
    switch (eventType) {
        case "pr:opened":
            await createChannelAndInviteParticipants(payload, slackGateway);
            break;
        case "pr:merged":
        case "pr:declined":
        case "pr:deleted":
            await sendCompletionMessageAndCloseTheChannel(payload, slackGateway);
            break;
        case "pr:comment:added":
            await sendPRCommentToSlack(payload as PullRequestCommentAddedPayload, slackGateway);
            break;
        default:
            throw new Error(`"${eventType}" event type is unknown.`);
    }
}