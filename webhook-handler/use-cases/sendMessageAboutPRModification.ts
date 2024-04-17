import {
    formatUserName,
    getPullRequestDescriptionForSlack,
    iconEmoji,
    slackLink,
    slackSection
} from "../slack-helpers";
import { SlackAPIAdapter } from "../ports/SlackAPIAdapter";
import { PullRequestModifiedNotification } from "../../typings";

export async function sendMessageAboutPRModification(payload: PullRequestModifiedNotification, slackAPI: SlackAPIAdapter, slackChannelId: string) {
    const visibleChanges = getChangesDescription(payload);
    if (visibleChanges.length == 0) {
        return;
    }

    const messageTitle = `:writing_hand: ${formatUserName(payload.actor)} changed the pull request`;
    const pleaseReviewText = `Please ${slackLink(payload.pullRequest.links.self[0].href, "review the PR")}`;

    await slackAPI.sendMessage({
        channelId: slackChannelId,
        iconEmoji: iconEmoji,
        text: messageTitle,
        blocks: [messageTitle, ...visibleChanges, pleaseReviewText].map(t => slackSection(t))
    });
}

function getChangesDescription(payload: PullRequestModifiedNotification) {
    const changesDescription = new Array<string>();

    if (payload.pullRequest.toRef.displayId != payload.previousTarget.displayId) {
        changesDescription.push(`Target is changed to \`${payload.pullRequest.toRef.displayId}\``);
    }
    if (payload.pullRequest.title != payload.previousTitle) {
        changesDescription.push(`Title is changed to: ${payload.pullRequest.title}`);
    }
    if (payload.pullRequest.description != payload.previousDescription) {
        if (payload.pullRequest.description) {
            changesDescription.push(`Description is changed to:\n\n${getPullRequestDescriptionForSlack(payload.pullRequest.description)}`);
        } else {
            changesDescription.push(`Description is deleted.`);
        }
    }
    return changesDescription;
}

