import { SlackTargetedChannel } from "../../slack-contracts/SlackTargetedChannel";
import { PullRequestReviewersUpdatedNotification } from "../../../bitbucket-payload-types";
import { WebhookPayloadHandler } from "../../WebhookPayloadHandler";

export class PullRequestReviewersUpdatedHandler implements WebhookPayloadHandler {
    public canHandle(payload: PullRequestReviewersUpdatedNotification) {
        return payload.eventKey == "pr:reviewer:updated";
    }

    public async handle(payload: PullRequestReviewersUpdatedNotification, slackChannel: SlackTargetedChannel) {
        await updateChannelMembers(payload, slackChannel);
    }
}

async function updateChannelMembers(payload: PullRequestReviewersUpdatedNotification, slackChannel: SlackTargetedChannel) {
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
