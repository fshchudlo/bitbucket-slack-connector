import { link, section, contextBlock } from "../utils/slack-building-blocks";
import { formatUserName, snapshotPullRequestState } from "../utils";
import { PullRequestBasicNotification } from "../../../types/bitbucket-payload-types";
import { SendMessageArguments, SlackBroadcastChannel } from "../../../types/slack-contracts";

export async function tryBroadcastMessageAboutOpenedPR(payload: PullRequestBasicNotification, broadcastChannel: SlackBroadcastChannel) {
    await broadcastChannel?.sendMessage(buildMessage(payload));
}

function buildMessage(payload: PullRequestBasicNotification): SendMessageArguments {
    const messageTitle = `:snowboarder: ${formatUserName(payload.actor)} opened pull request "${payload.pullRequest.title}".`;

    const targetText = `Target: \`${payload.pullRequest.toRef.repository.slug}/${payload.pullRequest.toRef.displayId}\``;
    const reviewers = payload.pullRequest.reviewers.map(r => formatUserName(r.user));
    const reviewersContextBlock = reviewers.length == 0 ? null : contextBlock(`Assigned reviewers: ${reviewers.join(",")}.`);

    const invitationText = `You're welcome to ${link(payload.pullRequest.links.self[0].href, "join code review")}.`;

    return {
        text: messageTitle,
        blocks: [section(messageTitle), contextBlock(targetText), reviewersContextBlock, section(invitationText)]
            .filter(b => !!b),
        metadata: snapshotPullRequestState(payload)
    };
}
