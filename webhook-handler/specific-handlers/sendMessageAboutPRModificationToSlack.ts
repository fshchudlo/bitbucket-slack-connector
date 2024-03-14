import buildChannelName from "../helper-functions/buildChannelName";
import { slackLink, slackQuote, slackSection } from "../slack-building-blocks";
import { SlackGateway } from "../gateways/SlackGateway";
import getPullRequestDescriptionForSlack from "../helper-functions/getPullRequestDescriptionForSlack";
import { Block } from "@slack/bolt";
import { formatUserName } from "../slack-building-blocks/formatUserName";

export async function sendMessageAboutPRModificationToSlack(payload: PullRequestModifiedNotification, slackGateway: SlackGateway) {
    const pullRequest = payload.pullRequest;
    const channelName = buildChannelName(pullRequest.toRef.repository.project.key, pullRequest.toRef.repository.slug, pullRequest.id);

    const changesDescriptionBlocks = new Array<Block>();
    let changesPlaceholder = null;

    if (pullRequest.title != payload.previousTitle) {
        changesPlaceholder = "title";
        changesDescriptionBlocks.push(slackSection(`${formatUserName(payload.actor)} changed pull request title to:`));
        changesDescriptionBlocks.push(slackSection(slackQuote(pullRequest.title)));
    }
    if (pullRequest.description != payload.previousDescription) {
        changesPlaceholder = "description";
        if (pullRequest.description) {
            changesDescriptionBlocks.push(slackSection(`${formatUserName(payload.actor)} changed pull request description to:`));
            changesDescriptionBlocks.push(slackSection(getPullRequestDescriptionForSlack(pullRequest.description)));
        } else {
            changesDescriptionBlocks.push(slackSection(`${formatUserName(payload.actor)} deleted pull request description.`));
        }
    }
    if (pullRequest.toRef.displayId != payload.previousTarget.displayId) {
        changesPlaceholder = "target";
        changesDescriptionBlocks.push(slackSection(`${formatUserName(payload.actor)} changed pull request target to \`${pullRequest.toRef.displayId}\``));
    }

    if (pullRequest.description != payload.previousDescription && pullRequest.title != payload.previousTitle && pullRequest.toRef.displayId != payload.previousTarget.displayId) {
        changesPlaceholder = "target, title, and description";
    }

    const pleaseReviewText = `Please ${slackLink(pullRequest.links.self[0].href, "review the PR")}`;

    await slackGateway.sendMessage({
        channel: channelName,
        text: `${formatUserName(payload.actor)} modified pull request ${changesPlaceholder}. ${pleaseReviewText}`,
        blocks: [...changesDescriptionBlocks, slackSection(pleaseReviewText)]
    });
}

