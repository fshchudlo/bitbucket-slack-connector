import {
    sendCompletionMessageAndCloseTheChannel,
    createChannelAndInviteParticipants,
    sendMessageAboutAddedComment,
    updateChannelMembers,
    sendMessageAboutNewCommit,
    sendMessageAboutReviewerAction,
    sendMessageAboutDeletedComment, sendMessageAboutEditedComment
} from "./specific-handlers";
import { SlackGateway } from "./SlackGateway";
import { BitbucketGateway } from "./BitbucketGateway";
import { sendMessageAboutPRModification } from "./specific-handlers/sendMessageAboutPRModification";
import { BitbucketNotification } from "../typings";

export default async function handleBitbucketWebhook(payload: BitbucketNotification, slackGateway: SlackGateway, bitbucketGateway: BitbucketGateway, usePrivateChannels: boolean = true, iconEmoji = ":bitbucket:") {
    const eventKey = payload.eventKey;
    switch (eventKey) {
        case "pr:opened":
            await createChannelAndInviteParticipants(payload, slackGateway, iconEmoji, usePrivateChannels);
            break;
        case "pr:reviewer:unapproved":
        case "pr:reviewer:needs_work":
        case "pr:reviewer:approved":
            await sendMessageAboutReviewerAction(payload, slackGateway, iconEmoji);
            break;
        case "pr:comment:added":
            await sendMessageAboutAddedComment(payload, slackGateway, iconEmoji);
            break;
        case "pr:comment:edited":
            await sendMessageAboutEditedComment(payload, slackGateway, iconEmoji);
            break;
        case "pr:comment:deleted":
            await sendMessageAboutDeletedComment(payload, slackGateway, iconEmoji);
            break;
        case "pr:from_ref_updated":
            await sendMessageAboutNewCommit(payload, slackGateway, bitbucketGateway, iconEmoji);
            break;
        case "pr:reviewer:updated":
            await updateChannelMembers(payload, slackGateway);
            break;
        case "pr:modified":
            await sendMessageAboutPRModification(payload, slackGateway, iconEmoji);
            break;
        case "pr:merged":
        case "pr:declined":
        case "pr:deleted":
            await sendCompletionMessageAndCloseTheChannel(payload, slackGateway, iconEmoji);
            break;
        default:
            throw new Error(`"${eventKey}" event key is unknown.`);
    }
}