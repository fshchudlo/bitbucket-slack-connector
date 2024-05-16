import { link, section, contextBlock } from "./slack-building-blocks";
import { formatUserName, snapshotPullRequestState } from "./helpers";
import { SendMessageArguments, SlackChannel } from "../SlackChannel";
import { PullRequestBasicNotification } from "../../bitbucket-payload-types";

export async function tryBroadcastMessageAboutOpenedPR(payload: PullRequestBasicNotification, broadcastChannel: SlackChannel) {
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
