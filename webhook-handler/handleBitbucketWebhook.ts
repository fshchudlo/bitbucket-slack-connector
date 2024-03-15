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

export default async function handleBitbucketWebhook(payload: BitbucketNotification, slackGateway: SlackGateway, bitbucketGateway: BitbucketGateway, iconEmoji = ":bitbucket:") {
    const eventKey = payload.eventKey;
    switch (eventKey) {
        case "pr:opened":
            await createChannelAndInviteParticipants(payload, slackGateway, iconEmoji);
            break;
        case "pr:reviewer:unapproved":
        case "pr:reviewer:needs_work":
        case "pr:reviewer:approved":
            await sendReviewerActionToSlack(payload, slackGateway, iconEmoji);
            break;
        case "pr:comment:added":
            await sendMessageAboutAddedCommentToSlack(payload, slackGateway, iconEmoji);
            break;
        case "pr:comment:deleted":
            await sendMessageAboutDeletedCommentToSlack(payload, slackGateway, iconEmoji);
            break;
        case "pr:from_ref_updated":
            await sendMessageAboutNewCommitToSlack(payload, slackGateway, bitbucketGateway, iconEmoji);
            break;
        case "pr:reviewer:updated":
            await updateChannelMembers(payload, slackGateway);
            break;
        case "pr:merged":
        case "pr:declined":
        case "pr:deleted":
            await sendCompletionMessageAndCloseTheChannel(payload, slackGateway, iconEmoji);
            break;
        case "pr:modified":
            await sendMessageAboutPRModificationToSlack(payload, slackGateway, iconEmoji);
            break;
        default:
            throw new Error(`"${eventKey}" event key is unknown.`);
    }
}