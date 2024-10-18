import { PullRequestReviewersUpdatedNotification } from "../../contracts";
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
    const userIdsToAdd = payload.addedReviewers.map(payload => payload.slackUserId);
    const userIdsToRemove = payload.removedReviewers.map(payload => payload.slackUserId);

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
