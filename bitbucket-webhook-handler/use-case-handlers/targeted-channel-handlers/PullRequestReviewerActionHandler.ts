
import { contextBlock, divider, link, section } from "../utils/slack-building-blocks";
import { formatUserName } from "../utils";
import { PullRequestNotification, PullRequestGenericNotification, PullRequestPayload } from "../../../types/normalized-payload-types";
import { WebhookPayloadHandler } from "../WebhookPayloadHandler";
import { SendMessageArguments, SlackTargetedChannel } from "../../slack-api-ports";

export class PullRequestReviewerActionHandler implements WebhookPayloadHandler {
    public canHandle(payload: PullRequestNotification) {
        return payload.eventKey == "pr:reviewer:approved" || payload.eventKey == "pr:reviewer:unapproved" || payload.eventKey == "pr:reviewer:needs_work";
    }

    public async handle(payload: PullRequestGenericNotification, slackChannel: SlackTargetedChannel) {
        await slackChannel.sendMessage(buildSlackMessage(payload));
    }
}

function buildSlackMessage(payload: PullRequestGenericNotification): SendMessageArguments {
    const pullRequest = payload.pullRequest;
    const messageTitle = getReviewerActionDescription(payload);
    const reviewStatus = getReviewStatus(pullRequest);
    return {
        text: messageTitle,
        blocks: [section(messageTitle), divider(), contextBlock(reviewStatus)]
    };
}

function getReviewerActionDescription(payload: PullRequestGenericNotification) {
    const prLink = link(payload.pullRequest.links.self, "pull request");
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
    const whoApproved = pullRequest.reviewers.filter(r => r.status == "APPROVED").map(r => r.user.name);
    const whoRequestedWork = pullRequest.reviewers.filter(r => r.status == "NEEDS_WORK").map(r => r.user.name);
    const whoUnapproved = pullRequest.reviewers.filter(r => r.status == "UNAPPROVED").map(r => r.user.name);

    if (whoRequestedWork.length == 0 && whoUnapproved.length == 0) {
        return `:large_green_circle: All reviewers approved PR. Seems like you can ${link(pullRequest.links.self, "merge it")}.`;
    }

    const reviewStatuses = [` Approved: ${whoApproved.length == 0 ? "0" : whoApproved.join(",")}`];
    whoRequestedWork.length > 0 ? reviewStatuses.push(` Requested changes: ${whoRequestedWork.join(",")}`) : "";
    whoUnapproved.length > 0 ? reviewStatuses.push(` Not reviewed: ${whoUnapproved.join(",")}`) : "";

    return `:large_yellow_circle: ${reviewStatuses.join(" | ")}`;
}