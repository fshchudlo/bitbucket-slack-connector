import { SlackAPIAdapter } from "../ports/SlackAPIAdapter";
import { PullRequestReviewersUpdatedNotification } from "../../typings";

export async function updateChannelMembers(payload: PullRequestReviewersUpdatedNotification, slackAPI: SlackAPIAdapter, slackChannelId: string) {
    const userIdsToAdd = await slackAPI.getSlackUserIds(payload.addedReviewers);
    const userIdsToRemove = await slackAPI.getSlackUserIds(payload.removedReviewers);

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