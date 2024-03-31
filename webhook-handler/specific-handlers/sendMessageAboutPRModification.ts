import {
    buildChannelName,
    formatUserName,
    getMessageColor,
    getPullRequestDescriptionForSlack,
    slackLink,
    slackQuote
} from "../slack-building-blocks";
import { SlackGateway } from "../SlackGateway";
import { PullRequestModifiedNotification } from "../../typings";

export async function sendMessageAboutPRModification(payload: PullRequestModifiedNotification, slackGateway: SlackGateway, iconEmoji: string) {
    const messageTitle = `${formatUserName(payload.actor)} changed the pull request`;
    const changesDescription = getChangesDescription(payload);
    const pleaseReviewText = `Please ${slackLink(payload.pullRequest.links.self[0].href, "review the PR")}`;

    await slackGateway.sendMessage({
        channel: buildChannelName(payload.pullRequest),
        icon_emoji: iconEmoji,
        attachments: [
            {
                title: messageTitle,
                text: [...changesDescription, pleaseReviewText].join("\n\n"),
                color: getMessageColor(payload)
            }]
    });
}

function getChangesDescription(payload: PullRequestModifiedNotification) {
    const changesDescription = new Array<string>();

    if (payload.pullRequest.title != payload.previousTitle) {
        changesDescription.push("Title is changed to:");
        changesDescription.push(slackQuote(payload.pullRequest.title));
    }
    if (payload.pullRequest.description != payload.previousDescription) {
        if (payload.pullRequest.description) {
            changesDescription.push("Description is changed to:");
            changesDescription.push(getPullRequestDescriptionForSlack(payload.pullRequest.description));
        } else {
            changesDescription.push(`Description is deleted.`);
        }
    }
    if (payload.pullRequest.toRef.displayId != payload.previousTarget.displayId) {
        changesDescription.push(`Target is changed to \`${payload.pullRequest.toRef.displayId}\``);
    }
    return changesDescription;
}

