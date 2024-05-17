import * as useCases from "./use-cases";
import { SlackChannel } from "./SlackChannel";
import { BitbucketNotification } from "../bitbucket-payload-types";
import { PullRequestNotificationHandler, PullRequestOpenedHandler } from "./use-cases";

const payloadHandlers = new Array<PullRequestNotificationHandler>(new PullRequestOpenedHandler());

export default async function sendTargetNotificationToSlack(payload: BitbucketNotification, pullRequestChannel: SlackChannel, broadcastChannel: SlackChannel = null) {
    const eventKey = payload.eventKey;
    for (const handler of payloadHandlers) {
        if (handler.canHandle(payload)) {
            await handler.handle(payload, pullRequestChannel);
        }
    }
    switch (eventKey) {
        case "pr:opened":
            await useCases.tryBroadcastMessageAboutOpenedPR(payload, broadcastChannel);
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
            await useCases.tryBroadcastMessageAboutClosedPR(payload, broadcastChannel);
            break;
    }
}

