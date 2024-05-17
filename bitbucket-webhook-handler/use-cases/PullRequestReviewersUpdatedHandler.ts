import { SlackChannel } from "../SlackChannel";
import { PullRequestReviewersUpdatedNotification } from "../../bitbucket-payload-types";
import { PullRequestNotificationHandler } from "./PullRequestNotificationHandler";

export class PullRequestReviewersUpdatedHandler implements PullRequestNotificationHandler {
    public canHandle(payload: PullRequestReviewersUpdatedNotification) {
        return payload.eventKey == "pr:reviewer:updated";
    }

    public async handle(payload: PullRequestReviewersUpdatedNotification, slackChannel: SlackChannel) {
        await this.updateChannelMembers(payload, slackChannel);
    }

    private async updateChannelMembers(payload: PullRequestReviewersUpdatedNotification, slackChannel: SlackChannel) {
        const userIdsToAdd = await slackChannel.getSlackUserIds(payload.addedReviewers.map(payload => payload.emailAddress));
        const userIdsToRemove = await slackChannel.getSlackUserIds(payload.removedReviewers.map(payload => payload.emailAddress));

        if (userIdsToAdd.length > 0) {
            await slackChannel.inviteToChannel({
                users: userIdsToAdd,
                force: true
            });
        }

        await slackChannel.kickFromChannel({
            users: userIdsToRemove
        });
    }
}

