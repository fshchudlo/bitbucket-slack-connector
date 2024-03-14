import { SlackGateway } from "../gateways/SlackGateway";
import buildChannelName from "../helper-functions/buildChannelName";
import { slackLink, slackSection } from "../slack-building-blocks";
import { formatUserName } from "../slack-building-blocks/formatUserName";

function getReviewerActionText(payload: PullRequestBasicNotification) {
    const prLink = slackLink(payload.pullRequest.links.self[0].href, "pull request");
    switch (payload.eventKey) {
        case "pr:reviewer:unapproved":
            return `${formatUserName(payload.actor)} unapproved ${prLink}.`;
        case "pr:reviewer:needs_work":
            return `${formatUserName(payload.actor)} requested changes for ${prLink}.`;
        case "pr:reviewer:approved":
            return `${formatUserName(payload.actor)} approved ${prLink}.`;
    }
}

function getReviewStatusBlocks(pullRequest: PullRequestPayload) {
    const whoApproved = pullRequest.reviewers.filter(r => r.status == "APPROVED");
    const whoRequestedWork = pullRequest.reviewers.filter(r => r.status == "NEEDS_WORK");
    const whoUnapproved = pullRequest.reviewers.filter(r => r.status == "UNAPPROVED");

    if (whoRequestedWork.length == 0 && whoUnapproved.length == 0) {
        return [slackSection(`All reviewers approved PR. Seems like you can ${slackLink(pullRequest.links.self[0].href, "merge it")}.`)];
    }

    let reviewStatus = whoApproved.length > 0 ? `Approved: ${whoApproved.map(r => r.user.displayName).join(",")}` : "";
    reviewStatus += whoRequestedWork.length > 0 ? `Needs work: ${whoRequestedWork.map(r => r.user.displayName).join(",")}` : "";
    reviewStatus += whoUnapproved.length > 0 ? `Unapproved: ${whoUnapproved.map(r => r.user.displayName).join(",")}` : "";

    return [slackSection(reviewStatus)];
}

export async function sendReviewerActionToSlack(payload: PullRequestBasicNotification, slackGateway: SlackGateway) {
    const pullRequest = payload.pullRequest;
    const channelName = buildChannelName(pullRequest.toRef.repository.project.key, pullRequest.toRef.repository.slug, pullRequest.id);

    const messageTitle = getReviewerActionText(payload);
    await slackGateway.sendMessage({
        channel: channelName,
        text: messageTitle,
        blocks: [slackSection(messageTitle), ...getReviewStatusBlocks(pullRequest)]
    });
}