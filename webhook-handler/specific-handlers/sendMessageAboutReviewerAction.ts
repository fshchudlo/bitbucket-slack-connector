import { SlackGateway } from "../SlackGateway";
import { buildChannelName, formatUserName, slackLink, slackSection } from "../slack-building-blocks";
import { PullRequestBasicNotification, PullRequestPayload } from "../../typings";

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

function getReviewStatus(pullRequest: PullRequestPayload) {
    const whoApproved = pullRequest.reviewers.filter(r => r.status == "APPROVED");
    const whoRequestedWork = pullRequest.reviewers.filter(r => r.status == "NEEDS_WORK");
    const whoUnapproved = pullRequest.reviewers.filter(r => r.status == "UNAPPROVED");

    if (whoRequestedWork.length == 0 && whoUnapproved.length == 0) {
        return `:large_green_circle: All reviewers approved PR. Seems like you can ${slackLink(pullRequest.links.self[0].href, "merge it")}.`;
    }

    let reviewStatus = whoApproved.length > 0 ? `Approved: ${whoApproved.map(r => r.user.displayName).join(",")}` : "";
    reviewStatus += whoRequestedWork.length > 0 ? `Needs work: ${whoRequestedWork.map(r => r.user.displayName).join(",")}` : "";
    reviewStatus += whoUnapproved.length > 0 ? `Unapproved: ${whoUnapproved.map(r => r.user.displayName).join(",")}` : "";

    return `:large_yellow_circle: ${reviewStatus}`;
}

export async function sendMessageAboutReviewerAction(payload: PullRequestBasicNotification, slackGateway: SlackGateway, iconEmoji: string) {
    const pullRequest = payload.pullRequest;
    const messageTitle = getReviewerActionText(payload);

    await slackGateway.sendMessage({
        channel: buildChannelName(pullRequest),
        icon_emoji: iconEmoji,
        text: messageTitle,
        blocks: [slackSection(messageTitle), slackSection(getReviewStatus(pullRequest))]
    });
}