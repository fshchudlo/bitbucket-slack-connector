import { link, section, divider, contextBlock } from "../utils/slack-building-blocks";
import { formatUserName, formatPullRequestDescription, reviewPRAction } from "../utils";
import { BitbucketNotification, PullRequestBasicNotification } from "../../../types/bitbucket-payload-types";
import { WebhookPayloadHandler } from "../../WebhookPayloadHandler";
import { SendMessageArguments, SlackTargetedChannel } from "../../../types/slack-contracts";

export class PullRequestOpenedHandler implements WebhookPayloadHandler {
    public canHandle(payload: BitbucketNotification) {
        return payload.eventKey == "pr:opened";
    }

    public async handle(payload: PullRequestBasicNotification, slackChannel: SlackTargetedChannel) {
        await inviteParticipants(payload, slackChannel);
        await setChannelBookmark(payload, slackChannel);
        await slackChannel.sendMessage(buildInvitationMessage(payload));
    }
}

async function setChannelBookmark(payload: PullRequestBasicNotification, slackChannel: SlackTargetedChannel) {
    await slackChannel.addBookmark({
        link: payload.pullRequest.links.self[0].href,
        emoji: ":git:",
        title: "Review Pull Request"
    });
}

async function inviteParticipants(payload: PullRequestBasicNotification, slackChannel: SlackTargetedChannel) {
    const allParticipants = [payload.pullRequest.author.user]
        .concat(payload.pullRequest.reviewers.map(r => r.user));

    const slackUserIds = (await slackChannel.getSlackUserIds(allParticipants.map(payload => payload.emailAddress)));

    if (slackUserIds.length > 0) {
        await slackChannel.inviteToChannel({ users: slackUserIds, force: true });
    }
}

function buildInvitationMessage(payload: PullRequestBasicNotification): SendMessageArguments {
    const messageTitle = `${formatUserName(payload.actor)} opened ${link(payload.pullRequest.links.self[0].href, "pull request")}`;
    const descriptionText = formatPullRequestDescription(payload.pullRequest.description ?? payload.pullRequest.title);
    return {
        text: messageTitle,
        blocks: [section(messageTitle), divider(), contextBlock(descriptionText), divider(), reviewPRAction(payload.pullRequest)]
    };
}