import {
    formatUserName,
    getPullRequestDescriptionForSlack,
    iconEmoji,
    link,
    section
} from "../slack-helpers";
import { SlackAPIAdapter } from "../ports/SlackAPIAdapter";
import { PullRequestModifiedNotification } from "../../typings";

export async function sendMessageAboutPRModification(payload: PullRequestModifiedNotification, slackAPI: SlackAPIAdapter, slackChannelId: string) {
    const visibleChanges = getChangesDescription(payload);
    if (visibleChanges.length == 0) {
        return;
    }

    const messageTitle = `:writing_hand: ${formatUserName(payload.actor)} changed the pull request`;
    const pleaseReviewText = `Please ${link(payload.pullRequest.links.self[0].href, "review the PR")}`;

    await slackAPI.sendMessage({
        channelId: slackChannelId,
        iconEmoji: iconEmoji,
        text: messageTitle,
        blocks: [messageTitle, ...visibleChanges, pleaseReviewText].map(t => section(t))
    });
}

function getChangesDescription(payload: PullRequestModifiedNotification) {
    const changesDescription = new Array<string>();
    const pullRequest = payload.pullRequest;

    if (pullRequest.toRef.displayId != payload.previousTarget.displayId) {
        changesDescription.push(`Target is changed to \`${pullRequest.toRef.displayId}\``);
    }
    if (pullRequest.title != payload.previousTitle) {
        changesDescription.push(`Title is changed to: ${pullRequest.title}`);
    }
    if (pullRequest.description != payload.previousDescription) {
        if (pullRequest.description) {
            changesDescription.push(`Description is changed to:\n\n${getPullRequestDescriptionForSlack(pullRequest.description)}`);
        } else {
            changesDescription.push(`Description is deleted.`);
        }
    }
    return changesDescription;
}

