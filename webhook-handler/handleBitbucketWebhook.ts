import {
    sendCompletionMessageAndCloseTheChannel,
    createChannelAndInviteParticipants,
    sendMessageAboutAddedCommentToSlack,
    updateChannelMembers,
    sendMessageAboutNewCommitToSlack, sendReviewerActionToSlack, sendMessageAboutDeletedCommentToSlack
} from "./specific-handlers";
import {
    PullRequestCommentAddedOrDeletedPayload, PullRequestModifiedPayload,
    PullRequestNotificationBasicPayload,
    PullRequestReviewersUpdatedPayload
} from "./contracts";
import { SlackGateway } from "./gateways/SlackGateway";
import { BitbucketGateway } from "./gateways/BitbucketGateway";
import { sendMessageAboutPRModificationToSlack } from "./specific-handlers/sendMessageAboutPRModificationToSlack";

type BitbucketPayload =
    PullRequestNotificationBasicPayload
    | PullRequestCommentAddedOrDeletedPayload
    | PullRequestReviewersUpdatedPayload | PullRequestModifiedPayload;

export default async function handleBitbucketWebhook(payload: BitbucketPayload, slackGateway: SlackGateway, bitbucketGateway: BitbucketGateway) {
    const eventType = payload.eventKey;
    switch (eventType) {
        case "pr:opened":
            await createChannelAndInviteParticipants(payload, slackGateway);
            break;
        case "pr:reviewer:unapproved":
        case "pr:reviewer:needs_work":
        case "pr:reviewer:approved":
            await sendReviewerActionToSlack(payload as PullRequestCommentAddedOrDeletedPayload, slackGateway);
            break;
        case "pr:comment:added":
            await sendMessageAboutAddedCommentToSlack(payload as PullRequestCommentAddedOrDeletedPayload, slackGateway);
            break;
        case "pr:comment:deleted":
            await sendMessageAboutDeletedCommentToSlack(payload as PullRequestCommentAddedOrDeletedPayload, slackGateway);
            break;
        case "pr:from_ref_updated":
            await sendMessageAboutNewCommitToSlack(payload, slackGateway, bitbucketGateway);
            break;
        case "pr:reviewer:updated":
            await updateChannelMembers(payload as PullRequestReviewersUpdatedPayload, slackGateway);
            break;
        case "pr:merged":
        case "pr:declined":
        case "pr:deleted":
            await sendCompletionMessageAndCloseTheChannel(payload, slackGateway);
            break;
        case "pr:modified":
            await sendMessageAboutPRModificationToSlack(payload as PullRequestModifiedPayload, slackGateway);
            break;
        default:
            throw new Error(`"${eventType}" event type is unknown.`);
    }
}