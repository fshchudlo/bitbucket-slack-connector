import { iconEmoji } from "./slack-building-blocks";
import { SlackNotificationChannel } from "../SlackNotificationChannel";
import { PullRequestBasicNotification } from "../../bitbucket-payload-types";
import { getPullRequestCompletionAction } from "./helpers/getPullRequestCompletionAction";

export async function tryBroadcastMessageAboutClosedPR(payload: PullRequestBasicNotification, slackAPI: SlackNotificationChannel, broadcastChannelId: string) {
    if (!broadcastChannelId) {
        return;
    }
    const initialBroadcastMessageId = await slackAPI.findPROpenedBroadcastMessageId(broadcastChannelId, new Date(payload.pullRequest.createdDate), {
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
