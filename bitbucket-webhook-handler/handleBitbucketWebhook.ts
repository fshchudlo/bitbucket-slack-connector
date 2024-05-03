import * as useCases from "./use-cases";
import { SlackChannel } from "./SlackChannel";
import { BitbucketNotification } from "../bitbucket-payload-types";
import { WebhookHandlerConfig } from "./webhookHandlerConfig";

export default async function handleBitbucketWebhook(payload: BitbucketNotification, pullRequestChannel: SlackChannel, config: WebhookHandlerConfig) {
    const eventKey = payload.eventKey;

    switch (eventKey) {
        case "pr:opened":
            await useCases.inviteParticipantsAndSetChannelBookmark(payload, pullRequestChannel, config.defaultChannelParticipants);
            await useCases.tryBroadcastMessageAboutOpenedPR(payload, pullRequestChannel, config.getOpenedPRBroadcastChannelId(payload));
            break;
        case "pr:modified":
            await useCases.sendMessageAboutPRModification(payload, pullRequestChannel);
            break;
        case "pr:reviewer:updated":
            await useCases.updateChannelMembers(payload, pullRequestChannel);
            break;
        case "pr:reviewer:unapproved":
        case "pr:reviewer:needs_work":
        case "pr:reviewer:approved":
            await useCases.sendMessageAboutReviewerAction(payload, pullRequestChannel);
            break;
        case "pr:comment:added":
            await useCases.sendMessageAboutAddedComment(payload, pullRequestChannel);
            break;
        case "pr:comment:edited":
            await useCases.sendMessageAboutEditedComment(payload, pullRequestChannel);
            break;
        case "pr:comment:deleted":
            await useCases.sendMessageAboutDeletedComment(payload, pullRequestChannel);
            break;
        case "pr:from_ref_updated":
            await useCases.sendMessageAboutNewCommit(payload, pullRequestChannel);
            break;
        case "pr:merged":
        case "pr:declined":
        case "pr:deleted":
            await useCases.sendCompletionMessageAndCloseTheChannel(payload, pullRequestChannel);
            await useCases.tryBroadcastMessageAboutClosedPR(payload, pullRequestChannel, config.getOpenedPRBroadcastChannelId(payload));
            break;
        default:
            throw new Error(`"${eventKey}" event key is unknown.`);
    }
}

