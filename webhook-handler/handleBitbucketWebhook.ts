import {
    sendCompletionMessageAndCloseTheChannel,
    createChannelAndInviteParticipants,
    sendMessageAboutAddedComment,
    updateChannelMembers,
    sendMessageAboutNewCommit,
    sendMessageAboutReviewerAction,
    sendMessageAboutDeletedComment, sendMessageAboutEditedComment
} from "./use-cases";
import { SlackAPIAdapter } from "./SlackAPIAdapter";
import { BitbucketGateway } from "./BitbucketGateway";
import { sendMessageAboutPRModification } from "./use-cases/sendMessageAboutPRModification";
import { BitbucketNotification } from "../typings";

export default async function handleBitbucketWebhook(payload: BitbucketNotification, slackAPI: SlackAPIAdapter, bitbucketGateway: BitbucketGateway, usePrivateChannels: boolean = true) {
    const eventKey = payload.eventKey;
    switch (eventKey) {
        case "pr:opened":
            await createChannelAndInviteParticipants(payload, slackAPI, usePrivateChannels);
            break;
        case "pr:reviewer:unapproved":
        case "pr:reviewer:needs_work":
        case "pr:reviewer:approved":
            await sendMessageAboutReviewerAction(payload, slackAPI);
            break;
        case "pr:comment:added":
            await sendMessageAboutAddedComment(payload, slackAPI);
            break;
        case "pr:comment:edited":
            await sendMessageAboutEditedComment(payload, slackAPI);
            break;
        case "pr:comment:deleted":
            await sendMessageAboutDeletedComment(payload, slackAPI);
            break;
        case "pr:from_ref_updated":
            await sendMessageAboutNewCommit(payload, slackAPI, bitbucketGateway);
            break;
        case "pr:reviewer:updated":
            await updateChannelMembers(payload, slackAPI);
            break;
        case "pr:modified":
            await sendMessageAboutPRModification(payload, slackAPI);
            break;
        case "pr:merged":
        case "pr:declined":
        case "pr:deleted":
            await sendCompletionMessageAndCloseTheChannel(payload, slackAPI);
            break;
        default:
            throw new Error(`"${eventKey}" event key is unknown.`);
    }
}