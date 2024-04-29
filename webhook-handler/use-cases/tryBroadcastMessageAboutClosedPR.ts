import { iconEmoji } from "./slack-building-blocks";
import { SlackAPIAdapter } from "../ports/SlackAPIAdapter";
import { PullRequestBasicNotification } from "../../typings";
import { getPullRequestCompletionAction } from "./helpers/getPullRequestCompletionAction";

export async function tryBroadcastMessageAboutClosedPR(payload: PullRequestBasicNotification, slackAPI: SlackAPIAdapter, broadcastChannelId: string) {
    if (!broadcastChannelId) {
        return;
    }
    const initialBroadcastMessageId = await slackAPI.findPROpenedBroadcastMessageId(broadcastChannelId, {
        pullRequestId: payload.pullRequest.id.toString(),
        projectKey: payload.pullRequest.toRef.repository.project.key,
        repositorySlug: payload.pullRequest.toRef.repository.slug
    });
    if (!initialBroadcastMessageId) {
        return;
    }
    const completionAction = getPullRequestCompletionAction(payload);

    await slackAPI.sendMessage({
        channelId: broadcastChannelId,
        iconEmoji: iconEmoji,
        text: `${completionAction.emoji} ${completionAction.text}`,
        threadId: initialBroadcastMessageId
    });
    await slackAPI.addReaction(broadcastChannelId, initialBroadcastMessageId, completionAction.reaction);
}
