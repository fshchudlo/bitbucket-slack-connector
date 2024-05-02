import { SendMessageArguments, SlackChannel } from "../SlackChannel";
import { contextBlock, divider, iconEmoji, link, section } from "./slack-building-blocks";
import { formatUserName } from "./helpers";
import { PullRequestBasicNotification, PullRequestPayload } from "../../bitbucket-payload-types";

export async function sendMessageAboutReviewerAction(payload: PullRequestBasicNotification, slackAPI: SlackChannel, slackChannelId: string) {
    await slackAPI.sendMessage(buildMessage(payload, slackChannelId));
}

function buildMessage(payload: PullRequestBasicNotification, channelId: string): SendMessageArguments {
    const pullRequest = payload.pullRequest;
    const messageTitle = getReviewerActionText(payload);
    const reviewStatus = getReviewStatus(pullRequest);
    return {
        channelId: channelId,
        iconEmoji: iconEmoji,
        text: messageTitle,
        blocks: [section(messageTitle), divider(), contextBlock(reviewStatus)]
    };
}

function getReviewerActionText(payload: PullRequestBasicNotification) {
    const prLink = link(payload.pullRequest.links.self[0].href, "pull request");
    switch (payload.eventKey) {
        case "pr:reviewer:unapproved":
            return `:traffic_light: ${formatUserName(payload.actor)} unapproved ${prLink}.`;
        case "pr:reviewer:needs_work":
            return `:traffic_light: ${formatUserName(payload.actor)} requested changes for the ${prLink}.`;
        case "pr:reviewer:approved":
            return `:traffic_light: ${formatUserName(payload.actor)} approved ${prLink}.`;
    }
}

function getReviewStatus(pullRequest: PullRequestPayload) {
    const whoApproved = pullRequest.reviewers.filter(r => r.status == "APPROVED").map(r => r.user.displayName);
    const whoRequestedWork = pullRequest.reviewers.filter(r => r.status == "NEEDS_WORK").map(r => r.user.displayName);
    const whoUnapproved = pullRequest.reviewers.filter(r => r.status == "UNAPPROVED").map(r => r.user.displayName);

    if (whoRequestedWork.length == 0 && whoUnapproved.length == 0) {
        return `:large_green_circle: All reviewers approved PR. Seems like you can ${link(pullRequest.links.self[0].href, "merge it")}.`;
    }

    const reviewStatuses = [` Approved: ${whoApproved.length == 0 ? "0" : whoApproved.join(",")}`];
    whoRequestedWork.length > 0 ? reviewStatuses.push(` Requested changes: ${whoRequestedWork.join(",")}`) : "";
    whoUnapproved.length > 0 ? reviewStatuses.push(` Not reviewed: ${whoUnapproved.join(",")}`) : "";

    return `:large_yellow_circle: ${reviewStatuses.join(" | ")}`;
}
