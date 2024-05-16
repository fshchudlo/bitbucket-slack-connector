import { SlackChannel } from "../SlackChannel";
import { PullRequestBasicNotification } from "../../bitbucket-payload-types";
import { getPullRequestCompletionAction } from "./helpers/getPullRequestCompletionAction";

export async function tryBroadcastMessageAboutClosedPR(payload: PullRequestBasicNotification, broadcastChannel: SlackChannel) {
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
