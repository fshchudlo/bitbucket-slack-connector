import {
    sendCompletionMessageAndCloseTheChannel,
    createChannelAndInviteParticipants,
    sendMessageAboutAddedCommentToSlack,
    updateChannelMembers,
    sendMessageAboutNewCommitToSlack,
    sendReviewerActionToSlack,
    sendMessageAboutDeletedCommentToSlack
} from "./specific-handlers";
import { SlackGateway } from "./gateways/SlackGateway";
import { BitbucketGateway } from "./gateways/BitbucketGateway";
import { sendMessageAboutPRModificationToSlack } from "./specific-handlers/sendMessageAboutPRModificationToSlack";
import { BitbucketNotification } from "../typings";

export default async function handleBitbucketWebhook(payload: BitbucketNotification, slackGateway: SlackGateway, bitbucketGateway: BitbucketGateway) {
    const eventType = payload.eventKey;
    switch (eventType) {
        case "pr:opened":
            await createChannelAndInviteParticipants(payload, slackGateway);
            break;
        case "pr:reviewer:unapproved":
        case "pr:reviewer:needs_work":
        case "pr:reviewer:approved":
            await sendReviewerActionToSlack(payload, slackGateway);
            break;
        case "pr:comment:added":
            await sendMessageAboutAddedCommentToSlack(payload, slackGateway);
            break;
        case "pr:comment:deleted":
            await sendMessageAboutDeletedCommentToSlack(payload, slackGateway);
            break;
        case "pr:from_ref_updated":
            await sendMessageAboutNewCommitToSlack(payload, slackGateway, bitbucketGateway);
            break;
        case "pr:reviewer:updated":
            await updateChannelMembers(payload, slackGateway);
            break;
        case "pr:merged":
        case "pr:declined":
        case "pr:deleted":
            await sendCompletionMessageAndCloseTheChannel(payload, slackGateway);
            break;
        case "pr:modified":
            await sendMessageAboutPRModificationToSlack(payload, slackGateway);
            break;
        default:
            throw new Error(`"${eventType}" event type is unknown.`);
    }
}