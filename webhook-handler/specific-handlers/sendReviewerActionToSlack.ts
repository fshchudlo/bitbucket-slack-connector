import { PullRequestCommentAddedPayload } from "../contracts";
import { SlackGateway } from "../gateways/SlackGateway";
import buildChannelName from "../helper-functions/buildChannelName";
import { slackLink } from "../slack-building-blocks";

export async function sendReviewerActionToSlack(payload: PullRequestCommentAddedPayload, slackGateway: SlackGateway) {
    const pullRequest = payload.pullRequest;
    const channelName = buildChannelName(pullRequest.toRef.repository.project.key, pullRequest.toRef.repository.slug, pullRequest.id);
    const prLink = slackLink(pullRequest.links.self[0].href, "pull request");
    let reviewerActionText = null;
    switch (payload.eventKey) {
        case "pr:reviewer:unapproved":
            reviewerActionText = ` unapproved ${prLink}.`;
            break;
        case "pr:reviewer:needs_work":
            reviewerActionText = ` requested changes for ${prLink}.`;
            break;
        case "pr:reviewer:approved":
            reviewerActionText = ` approved ${prLink}.`;
            break;
    }


    const messageTitle = `*${payload.actor.displayName}* ${reviewerActionText}`;
    await slackGateway.sendMessage({
        channel: channelName,
        text: `${messageTitle}`
    });
}