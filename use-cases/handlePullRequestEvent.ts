import * as useCases from "./use-case-handlers";
import { PullRequestNotification } from "./contracts";

import { SlackBroadcastChannel, SlackTargetedChannel } from "./slack-api-ports";

const payloadHandlers = new Array<useCases.WebhookPayloadHandler>(
    new useCases.PullRequestOpenedHandler(),
    new useCases.PullRequestModifiedHandler(),
    new useCases.PullRequestReviewersUpdatedHandler(),
    new useCases.PullRequestReviewerActionHandler(),
    new useCases.CommentAddedHandler(),
    new useCases.CommentEditedHandler(),
    new useCases.CommentDeletedHandler(),
    new useCases.NewCommitAddedHandler(),
    new useCases.PullRequestCompletionHandler()
);

export default async function handlePullRequestEvent(payload: PullRequestNotification, pullRequestChannel: SlackTargetedChannel, broadcastChannel: SlackBroadcastChannel = null) {
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
        case "pr:merged":
        case "pr:declined":
        case "pr:deleted":
            await useCases.tryBroadcastMessageAboutClosedPR(payload, broadcastChannel);
            break;
    }
}

