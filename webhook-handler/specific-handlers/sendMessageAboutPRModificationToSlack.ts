import { PullRequestModifiedPayload } from "../contracts";
import buildChannelName from "../helper-functions/buildChannelName";
import { slackLink, slackQuote, slackSection } from "../slack-building-blocks";
import { SlackGateway } from "../gateways/SlackGateway";
import getPullRequestDescriptionForSlack from "../helper-functions/getPullRequestDescriptionForSlack";
import { Block } from "@slack/bolt";

export async function sendMessageAboutPRModificationToSlack(payload: PullRequestModifiedPayload, slackGateway: SlackGateway) {
    const pullRequest = payload.pullRequest;
    const channelName = buildChannelName(pullRequest.toRef.repository.project.key, pullRequest.toRef.repository.slug, pullRequest.id);

    const changesDescriptionBlocks = new Array<Block>();
    let changesPlaceholder = null;

    if (pullRequest.title != payload.previousTitle) {
        changesPlaceholder = "title";
        changesDescriptionBlocks.push(slackSection(`${payload.actor.displayName} changed pull request title to:`));
        changesDescriptionBlocks.push(slackSection(slackQuote(pullRequest.title)));
    }
    if (pullRequest.description != payload.previousDescription) {
        changesPlaceholder = "description";
        if (pullRequest.description) {
            changesDescriptionBlocks.push(slackSection(`${payload.actor.displayName} changed pull request description to:`));
            changesDescriptionBlocks.push(slackSection(getPullRequestDescriptionForSlack(pullRequest.description)));
        } else {
            changesDescriptionBlocks.push(slackSection(`${payload.actor.displayName} deleted pull request description.`));
        }
    }
    if (pullRequest.toRef.displayId != payload.previousTarget.displayId) {
        changesPlaceholder = "target";
        changesDescriptionBlocks.push(slackSection(`${payload.actor.displayName} changed pull request target to ${pullRequest.toRef.displayId}`));
    }

    if (pullRequest.description != payload.previousDescription && pullRequest.title != payload.previousTitle && pullRequest.toRef.displayId != payload.previousTarget.displayId) {
        changesPlaceholder = "target, title, and description";
    }

    const pleaseReviewText = `Please ${slackLink(pullRequest.links.self[0].href, "review the PR")}`;

    await slackGateway.sendMessage({
        channel: channelName,
        text: `${payload.actor.displayName} modified pull request ${changesPlaceholder}. ${pleaseReviewText}`,
        blocks: [...changesDescriptionBlocks, slackSection(pleaseReviewText)]
    });
}

