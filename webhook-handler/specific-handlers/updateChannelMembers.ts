import { SlackGateway } from "../gateways/SlackGateway";
import buildChannelName from "../helper-functions/buildChannelName";
import { PullRequestReviewersUpdatedNotification } from "../../typings";

export async function updateChannelMembers(payload: PullRequestReviewersUpdatedNotification, slackGateway: SlackGateway) {
    const pullRequest = payload.pullRequest;
    const channelName = buildChannelName(pullRequest);

    const channelId = await slackGateway.getChannelId(channelName);
    const userIdsToAdd = await slackGateway.getSlackUserIds(payload.addedReviewers);
    const userIdsToRemove = await slackGateway.getSlackUserIds(payload.removedReviewers);

    await slackGateway.inviteToChannel({
        channel: channelId,
        users: userIdsToAdd.join(","),
        force: true
    });

    await Promise.all(userIdsToRemove.map(async userId => {
        await slackGateway.kickFromChannel({
            channel: channelId,
            user: userId
        });
    }));
}