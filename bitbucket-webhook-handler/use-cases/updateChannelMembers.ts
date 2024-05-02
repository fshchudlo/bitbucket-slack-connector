import { SlackChannel } from "../SlackChannel";
import { PullRequestReviewersUpdatedNotification } from "../../bitbucket-payload-types";

export async function updateChannelMembers(payload: PullRequestReviewersUpdatedNotification, slackAPI: SlackChannel, slackChannelId: string) {
    const userIdsToAdd = await slackAPI.getSlackUserIds(payload.addedReviewers.map(payload => payload.emailAddress));
    const userIdsToRemove = await slackAPI.getSlackUserIds(payload.removedReviewers.map(payload => payload.emailAddress));

    if (userIdsToAdd.length > 0) {
        await slackAPI.inviteToChannel({
            channelId: slackChannelId,
            users: userIdsToAdd,
            force: true
        });
    }

    await slackAPI.kickFromChannel({
        channelId: slackChannelId,
        users: userIdsToRemove
    });
}