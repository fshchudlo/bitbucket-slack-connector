import { SlackAPIAdapter } from "../SlackAPIAdapter";
import { buildChannelName } from "../slack-building-blocks";
import { PullRequestReviewersUpdatedNotification } from "../../typings";

export async function updateChannelMembers(payload: PullRequestReviewersUpdatedNotification, slackGateway: SlackAPIAdapter) {
    const channelInfo = await slackGateway.getChannelInfo(buildChannelName(payload.pullRequest), true);
    const userIdsToAdd = await slackGateway.getSlackUserIds(payload.addedReviewers);
    const userIdsToRemove = await slackGateway.getSlackUserIds(payload.removedReviewers);

    if (userIdsToAdd.length > 0) {
        await slackGateway.inviteToChannel({
            channel: channelInfo.id,
            users: userIdsToAdd.join(","),
            force: true
        });
    }

    await Promise.all(userIdsToRemove.map(async userId => {
        await slackGateway.kickFromChannel({
            channel: channelInfo.id,
            user: userId
        });
    }));
}