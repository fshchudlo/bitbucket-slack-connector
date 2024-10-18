import { link, section, divider, contextBlock } from "../utils/slack-building-blocks";
import { formatUserName, formatPullRequestDescription, reviewPRAction } from "../utils";
import { PullRequestGenericNotification } from "../../contracts";
import { WebhookPayloadHandler } from "../WebhookPayloadHandler";
import { SendMessageArguments, SlackTargetedChannel } from "../../slack-api-ports";

export class PullRequestOpenedHandler implements WebhookPayloadHandler {
    public canHandle(payload: PullRequestGenericNotification) {
        return payload.eventKey == "pr:opened";
    }

    public async handle(payload: PullRequestGenericNotification, slackChannel: SlackTargetedChannel) {
        await inviteParticipants(payload, slackChannel);
        await setChannelBookmark(payload, slackChannel);
        await slackChannel.sendMessage(buildInvitationMessage(payload));
    }
}

async function setChannelBookmark(payload: PullRequestGenericNotification, slackChannel: SlackTargetedChannel) {
    await slackChannel.addBookmark({
        link: payload.pullRequest.links.self,
        emoji: ":git:",
        title: "Review Pull Request"
    });
}

async function inviteParticipants(payload: PullRequestGenericNotification, slackChannel: SlackTargetedChannel) {
    const slackUserIds = [payload.pullRequest.author, ...payload.pullRequest.reviewers.map(r => r.user)].map(u=>u.slackUserId);
    if (slackUserIds.length > 0) {
        await slackChannel.inviteToChannel({ users: slackUserIds, force: true });
    }
}

function buildInvitationMessage(payload: PullRequestGenericNotification): SendMessageArguments {
    const messageTitle = `${formatUserName(payload.actor)} opened ${link(payload.pullRequest.links.self, "pull request")}`;
    const descriptionText = formatPullRequestDescription(payload.pullRequest.description ?? payload.pullRequest.title);
    return {
        text: messageTitle,
        blocks: [section(messageTitle), divider(), contextBlock(descriptionText), divider(), reviewPRAction(payload.pullRequest)]
    };
}