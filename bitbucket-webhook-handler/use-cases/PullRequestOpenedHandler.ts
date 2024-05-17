import { link, section, divider, contextBlock } from "./slack-building-blocks";
import { formatUserName, formatPullRequestDescription, reviewPRAction } from "./helpers";
import { SendMessageArguments, SlackChannel } from "../SlackChannel";
import { BitbucketNotification, PullRequestBasicNotification } from "../../bitbucket-payload-types";
import { PullRequestNotificationHandler } from "./PullRequestNotificationHandler";

export class PullRequestOpenedHandler implements PullRequestNotificationHandler {
    public canHandle(payload: BitbucketNotification) {
        return payload.eventKey == "pr:opened";
    }

    public async handle(payload: PullRequestBasicNotification, slackChannel: SlackChannel) {
        await this.inviteParticipants(payload, slackChannel);
        await this.setChannelBookmark(payload, slackChannel);
        await slackChannel.sendMessage(this.buildInvitationMessage(payload));
    }

    private async setChannelBookmark(payload: PullRequestBasicNotification, slackChannel: SlackChannel) {
        await slackChannel.addBookmark({
            link: payload.pullRequest.links.self[0].href,
            emoji: ":git:",
            title: "Review Pull Request"
        });
    }

    private async inviteParticipants(payload: PullRequestBasicNotification, slackChannel: SlackChannel) {
        const allParticipants = [payload.pullRequest.author.user]
            .concat(payload.pullRequest.reviewers.map(r => r.user));

        const slackUserIds = (await slackChannel.getSlackUserIds(allParticipants.map(payload => payload.emailAddress)));

        if (slackUserIds.length > 0) {
            await slackChannel.inviteToChannel({ users: slackUserIds, force: true });
        }
    }

    private buildInvitationMessage(payload: PullRequestBasicNotification): SendMessageArguments {
        const messageTitle = `${formatUserName(payload.actor)} opened ${link(payload.pullRequest.links.self[0].href, "pull request")}`;
        const descriptionText = formatPullRequestDescription(payload.pullRequest.description ?? payload.pullRequest.title);
        return {
            text: messageTitle,
            blocks: [section(messageTitle), divider(), contextBlock(descriptionText), divider(), reviewPRAction(payload.pullRequest)]
        };
    }
}