import { link, section, contextBlock } from "../utils/slack-building-blocks";
import { formatUserName, snapshotPullRequestState } from "../utils";
import { PullRequestGenericNotification } from "../../../types/normalized-payload-types";
import { SendMessageArguments, SlackBroadcastChannel } from "../../slack-api-ports";

export async function tryBroadcastMessageAboutOpenedPR(payload: PullRequestGenericNotification, broadcastChannel: SlackBroadcastChannel) {
    await broadcastChannel?.sendMessage(buildMessage(payload));
}

function buildMessage(payload: PullRequestGenericNotification): SendMessageArguments {
    const messageTitle = `:snowboarder: ${formatUserName(payload.actor)} opened pull request "${payload.pullRequest.title}".`;

    const targetText = `Target: \`${payload.pullRequest.targetBranch.repositoryName}/${payload.pullRequest.targetBranch.branchName}\``;
    const reviewers = payload.pullRequest.reviewers.map(r => formatUserName(r.user));
    const reviewersContextBlock = reviewers.length == 0 ? null : contextBlock(`Assigned reviewers: ${reviewers.join(",")}.`);

    const invitationText = `You're welcome to ${link(payload.pullRequest.links.self, "join code review")}.`;

    return {
        text: messageTitle,
        blocks: [section(messageTitle), contextBlock(targetText), reviewersContextBlock, section(invitationText)]
            .filter(b => !!b),
        metadata: snapshotPullRequestState(payload)
    };
}
