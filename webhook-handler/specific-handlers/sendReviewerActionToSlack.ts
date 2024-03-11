import { PullRequestCommentAddedPayload, PullRequestPayload } from "../contracts";
import { SlackGateway } from "../gateways/SlackGateway";
import buildChannelName from "../helper-functions/buildChannelName";
import { slackLink, slackSection } from "../slack-building-blocks";

function getReviewerActionText(payload: PullRequestCommentAddedPayload, prLink: string) {
    switch (payload.eventKey) {
        case "pr:reviewer:unapproved":
            return ` unapproved ${prLink}.`;
        case "pr:reviewer:needs_work":
            return ` requested changes for ${prLink}.`;
        case "pr:reviewer:approved":
            return ` approved ${prLink}.`;
    }
}

function getReviewStatusBlocks(pullRequest: PullRequestPayload) {
    const whoApproved = pullRequest.reviewers.filter(r => r.status == "APPROVED");
    const whoRequestedWork = pullRequest.reviewers.filter(r => r.status == "NEEDS_WORK");
    const whoUnapproved = pullRequest.reviewers.filter(r => r.status == "UNAPPROVED");

    let reviewStatus = whoApproved.length > 0 ? `Approved: ${whoApproved.map(r => r.user.displayName).join(",")}` : "";
    reviewStatus += whoRequestedWork.length > 0 ? `Needs work: ${whoRequestedWork.map(r => r.user.displayName).join(",")}` : "";
    reviewStatus += whoUnapproved.length > 0 ? `Unapproved: ${whoUnapproved.map(r => r.user.displayName).join(",")}` : "";

    const messageBlocks = [
        slackSection(reviewStatus)
    ];

    if (whoRequestedWork.length == 0 && whoUnapproved.length == 0) {
        messageBlocks.push(slackSection(`All reviewers approved PR. Seems like you can ${slackLink(pullRequest.links.self[0].href, "merge it")}.`));
    }
    return messageBlocks;
}

export async function sendReviewerActionToSlack(payload: PullRequestCommentAddedPayload, slackGateway: SlackGateway) {
    const pullRequest = payload.pullRequest;
    const channelName = buildChannelName(pullRequest.toRef.repository.project.key, pullRequest.toRef.repository.slug, pullRequest.id);
    const prLink = slackLink(pullRequest.links.self[0].href, "pull request");
    const messageTitle = `*${payload.actor.displayName}* ${getReviewerActionText(payload, prLink)}`;
    await slackGateway.sendMessage({
        channel: channelName,
        text: messageTitle,
        blocks: [slackSection(messageTitle), ...getReviewStatusBlocks(pullRequest)]
    });
}