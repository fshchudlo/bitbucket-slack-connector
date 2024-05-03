import { iconEmoji, link, section, contextBlock } from "./slack-building-blocks";
import { formatUserName, snapshotPullRequestState } from "./helpers";
import { SendMessageArguments, SlackChannel } from "../SlackChannel";
import { PullRequestBasicNotification } from "../../bitbucket-payload-types";

export async function tryBroadcastMessageAboutOpenedPR(payload: PullRequestBasicNotification, slackAPI: SlackChannel, broadcastChannelId: string) {
    if (broadcastChannelId) {
        await slackAPI.sendMessage(buildMessage(payload, broadcastChannelId));
    }
}

function buildMessage(payload: PullRequestBasicNotification, channelId: string): SendMessageArguments {
    const messageTitle = `:snowboarder: ${formatUserName(payload.actor)} opened pull request "${payload.pullRequest.title}".`;

    const targetText = `Target: \`${payload.pullRequest.toRef.repository.slug}/${payload.pullRequest.toRef.displayId}\``;
    const reviewers = payload.pullRequest.reviewers.map(r => formatUserName(r.user));
    const reviewersContextBlock = reviewers.length == 0 ? null : contextBlock(`Assigned reviewers: ${reviewers.join(",")}.`);

    const invitationText = `You're welcome to ${link(payload.pullRequest.links.self[0].href, "join code review")}.`;

    return {
        iconEmoji: iconEmoji,
        text: messageTitle,
        blocks: [section(messageTitle), contextBlock(targetText), reviewersContextBlock, section(invitationText)]
            .filter(b => !!b),
        metadata: snapshotPullRequestState(payload)
    };
}
