import { iconEmoji } from "./slack-building-blocks";
import { SlackChannel } from "../SlackChannel";
import { PullRequestBasicNotification } from "../../bitbucket-payload-types";
import { getPullRequestCompletionAction } from "./helpers/getPullRequestCompletionAction";

export async function tryBroadcastMessageAboutClosedPR(payload: PullRequestBasicNotification, slackChannel: SlackChannel, broadcastChannelId: string) {
    if (!broadcastChannelId) {
        return;
    }
    const initialBroadcastMessageId = await slackChannel.findPROpenedBroadcastMessageId(broadcastChannelId, new Date(payload.pullRequest.createdDate), {
        pullRequestId: payload.pullRequest.id.toString(),
        projectKey: payload.pullRequest.toRef.repository.project.key,
        repositorySlug: payload.pullRequest.toRef.repository.slug
    });
    if (!initialBroadcastMessageId) {
        return;
    }
    const completionAction = getPullRequestCompletionAction(payload);

    await slackChannel.sendMessage({
        iconEmoji: iconEmoji,
        text: `${completionAction.emoji} ${completionAction.text}`,
        threadId: initialBroadcastMessageId
    });
    await slackChannel.addReaction(initialBroadcastMessageId, completionAction.reaction);
}
