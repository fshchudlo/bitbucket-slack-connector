import { createChannelAndInviteParticipants } from "./specific-handlers/createChannelAndInviteParticipants";
import { sendCompletionMessageAndCloseTheChannel } from "./specific-handlers/sendCompletionMessageAndCloseTheChannel";
import { sendPRCommentToSlack } from "./specific-handlers/sendPRCommentToSlack";
import { PullRequestBasicPayload, PullRequestCommentAddedPayload } from "./contracts";
import { SlackGateway } from "./gateways/SlackGateway";
import { sendMessageAboutNewCommitToSlack } from "./specific-handlers/sendMessageAboutNewCommitToSlack";
import { BitbucketGateway } from "./gateways/BitbucketGateway";

type BitbucketPayload = PullRequestBasicPayload | PullRequestCommentAddedPayload;
export default async function handleBitbucketWebhook(payload: BitbucketPayload, slackGateway: SlackGateway, bitbucketGateway: BitbucketGateway) {
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
        case "pr:from_ref_updated":
            await sendMessageAboutNewCommitToSlack(payload, slackGateway, bitbucketGateway);
            break;
        default:
            throw new Error(`"${eventType}" event type is unknown.`);
    }
}