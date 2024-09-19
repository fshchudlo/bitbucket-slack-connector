import { PullRequestGenericNotification } from "../../../types/normalized-payload-types";
import { getPullRequestCompletionAction } from "../utils/getPullRequestCompletionAction";

import { SlackBroadcastChannel } from "../../../types/slack-contracts";

export async function tryBroadcastMessageAboutClosedPR(payload: PullRequestGenericNotification, broadcastChannel: SlackBroadcastChannel) {
    if (!broadcastChannel) {
        return;
    }
    const initialBroadcastMessageId = await broadcastChannel.findPROpenedBroadcastMessageId(payload.pullRequest.createdAt, {
        pullRequestId: payload.pullRequest.number.toString(),
        projectKey: payload.pullRequest.targetBranch.projectKey,
        repositorySlug: payload.pullRequest.targetBranch.repositoryName
    });
    if (!initialBroadcastMessageId) {
        return;
    }
    const completionAction = getPullRequestCompletionAction(payload);

    await broadcastChannel.sendMessage({
        text: `${completionAction.emoji} ${completionAction.text}`,
        threadId: initialBroadcastMessageId
    });
    await broadcastChannel.addReaction(initialBroadcastMessageId, completionAction.reaction);
}
