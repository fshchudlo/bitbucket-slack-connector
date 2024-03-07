import { PullRequestReviewersUpdatedPayload } from "../contracts";
import { SlackGateway } from "../gateways/SlackGateway";
import buildChannelName from "../helper-functions/buildChannelName";
import getSlackUserIds from "../helper-functions/getSlackUserIds";

export async function updateChannelMembers(payload: PullRequestReviewersUpdatedPayload, slackGateway: SlackGateway) {
    const pullRequest = payload.pullRequest;
    const channelName = buildChannelName(pullRequest.toRef.repository.project.key, pullRequest.toRef.repository.slug, pullRequest.id);

    const userIdsToAdd = await getSlackUserIds(payload.addedReviewers, slackGateway);
    const userIdsToRemove = await getSlackUserIds(payload.removedReviewers, slackGateway);

    await slackGateway.inviteToChannel({
        channel: channelName,
        users: userIdsToAdd.join(","),
        force: true
    });

    await Promise.all(userIdsToRemove.map(async userId => {
        await slackGateway.kickFromChannel({
            channel: channelName,
            user: userId
        });
    }));
}