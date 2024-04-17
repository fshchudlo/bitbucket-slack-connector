import { SlackAPIAdapter, SlackChannelInfo } from "../SlackAPIAdapter";
import { PullRequestReviewersUpdatedNotification } from "../../typings";

export async function updateChannelMembers(payload: PullRequestReviewersUpdatedNotification, slackAPI: SlackAPIAdapter, channel: SlackChannelInfo) {
    const userIdsToAdd = await slackAPI.getSlackUserIds(payload.addedReviewers);
    const userIdsToRemove = await slackAPI.getSlackUserIds(payload.removedReviewers);

    if (userIdsToAdd.length > 0) {
        await slackAPI.inviteToChannel({
            channelId: channel.id,
            users: userIdsToAdd,
            force: true
        });
    }

    await Promise.all(userIdsToRemove.map(async userId => {
        await slackAPI.kickFromChannel({
            channelId: channel.id,
            user: userId
        });
    }));
}