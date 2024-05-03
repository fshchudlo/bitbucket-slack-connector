import * as useCases from "./use-cases";
import { SlackChannel } from "./SlackChannel";
import { BitbucketNotification } from "../bitbucket-payload-types";
import { WebhookHandlerConfig } from "./webhookHandlerConfig";

export default async function handleBitbucketWebhook(payload: BitbucketNotification, slackAPI: SlackChannel, config: WebhookHandlerConfig) {
    const eventKey = payload.eventKey;

    switch (eventKey) {
        case "pr:opened":
            await useCases.inviteParticipantsAndSetChannelBookmark(payload, slackAPI, config.defaultChannelParticipants);
            await useCases.tryBroadcastMessageAboutOpenedPR(payload, slackAPI, config.getOpenedPRBroadcastChannelId(payload));
            break;
        case "pr:modified":
            await useCases.sendMessageAboutPRModification(payload, slackAPI);
            break;
        case "pr:reviewer:updated":
            await useCases.updateChannelMembers(payload, slackAPI);
            break;
        case "pr:reviewer:unapproved":
        case "pr:reviewer:needs_work":
        case "pr:reviewer:approved":
            await useCases.sendMessageAboutReviewerAction(payload, slackAPI);
            break;
        case "pr:comment:added":
            await useCases.sendMessageAboutAddedComment(payload, slackAPI);
            break;
        case "pr:comment:edited":
            await useCases.sendMessageAboutEditedComment(payload, slackAPI);
            break;
        case "pr:comment:deleted":
            await useCases.sendMessageAboutDeletedComment(payload, slackAPI);
            break;
        case "pr:from_ref_updated":
            await useCases.sendMessageAboutNewCommit(payload, slackAPI);
            break;
        case "pr:merged":
        case "pr:declined":
        case "pr:deleted":
            await useCases.sendCompletionMessageAndCloseTheChannel(payload, slackAPI);
            await useCases.tryBroadcastMessageAboutClosedPR(payload, slackAPI, config.getOpenedPRBroadcastChannelId(payload));
            break;
        default:
            throw new Error(`"${eventKey}" event key is unknown.`);
    }
}

