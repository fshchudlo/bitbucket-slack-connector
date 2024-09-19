import { PullRequestBasicNotification } from "../../../types/bitbucket-payload-types";
import { getPullRequestCompletionAction } from "../utils/getPullRequestCompletionAction";

import { SlackBroadcastChannel } from "../../../types/slack-contracts";

export async function tryBroadcastMessageAboutClosedPR(payload: PullRequestBasicNotification, broadcastChannel: SlackBroadcastChannel) {
    if (!broadcastChannel) {
        return;
    }
    const initialBroadcastMessageId = await broadcastChannel.findPROpenedBroadcastMessageId(new Date(payload.pullRequest.createdDate), {
        pullRequestId: payload.pullRequest.id.toString(),
        projectKey: payload.pullRequest.toRef.repository.project.key,
        repositorySlug: payload.pullRequest.toRef.repository.slug
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
