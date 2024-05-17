import { SendMessageArguments, SlackChannel } from "../SlackChannel";
import { contextBlock, divider, link, section } from "./slack-building-blocks";
import { formatUserName } from "./helpers";
import { BitbucketNotification, PullRequestBasicNotification, PullRequestPayload } from "../../bitbucket-payload-types";
import { PullRequestNotificationHandler } from "./PullRequestNotificationHandler";

export class PullRequestReviewerActionHandler implements PullRequestNotificationHandler {
    public canHandle(payload: BitbucketNotification) {
        return payload.eventKey == "pr:reviewer:approved" || payload.eventKey == "pr:reviewer:unapproved" || payload.eventKey == "pr:reviewer:needs_work";
    }

    public async handle(payload: PullRequestBasicNotification, slackChannel: SlackChannel) {
        await this.sendMessageAboutReviewerAction(payload, slackChannel);
    }

    private async sendMessageAboutReviewerAction(payload: PullRequestBasicNotification, slackChannel: SlackChannel) {
        await slackChannel.sendMessage(this.buildMessage(payload));
    }

    private buildMessage(payload: PullRequestBasicNotification): SendMessageArguments {
        const pullRequest = payload.pullRequest;
        const messageTitle = this.getReviewerActionText(payload);
        const reviewStatus = this.getReviewStatus(pullRequest);
        return {
            text: messageTitle,
            blocks: [section(messageTitle), divider(), contextBlock(reviewStatus)]
        };
    }

    private getReviewerActionText(payload: PullRequestBasicNotification) {
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

    private getReviewStatus(pullRequest: PullRequestPayload) {
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
}
