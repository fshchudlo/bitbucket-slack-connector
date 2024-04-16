import { SlackAPIAdapter } from "../SlackAPIAdapter";
import { PullRequestReviewersUpdatedNotification } from "../../typings";
import { findPullRequestChannel } from "../slack-helpers/findPullRequestChannel";

export async function updateChannelMembers(payload: PullRequestReviewersUpdatedNotification, slackAPI: SlackAPIAdapter) {
    const channelInfo = await findPullRequestChannel(slackAPI, payload.pullRequest);
    const userIdsToAdd = await slackAPI.getSlackUserIds(payload.addedReviewers);
    const userIdsToRemove = await slackAPI.getSlackUserIds(payload.removedReviewers);

    if (userIdsToAdd.length > 0) {
        await slackAPI.inviteToChannel({
            channelId: channelInfo.id,
            users: userIdsToAdd,
            force: true
        });
    }

    await Promise.all(userIdsToRemove.map(async userId => {
        await slackAPI.kickFromChannel({
            channelId: channelInfo.id,
            user: userId
        });
    }));
}