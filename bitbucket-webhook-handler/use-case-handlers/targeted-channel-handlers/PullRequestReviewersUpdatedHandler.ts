import { PullRequestReviewersUpdatedNotification } from "../../../types/normalized-payload-types";
import { WebhookPayloadHandler } from "../WebhookPayloadHandler";
import { SlackTargetedChannel } from "../../slack-api-ports";

export class PullRequestReviewersUpdatedHandler implements WebhookPayloadHandler {
    public canHandle(payload: PullRequestReviewersUpdatedNotification) {
        return payload.eventKey == "pr:reviewer:updated";
    }

    public async handle(payload: PullRequestReviewersUpdatedNotification, slackChannel: SlackTargetedChannel) {
        await updateChannelMembers(payload, slackChannel);
    }
}

async function updateChannelMembers(payload: PullRequestReviewersUpdatedNotification, slackChannel: SlackTargetedChannel) {
    const userIdsToAdd = await slackChannel.getSlackUserIds(payload.addedReviewers.map(payload => payload.email));
    const userIdsToRemove = await slackChannel.getSlackUserIds(payload.removedReviewers.map(payload => payload.email));

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
