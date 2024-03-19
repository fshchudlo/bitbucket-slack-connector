import buildChannelName from "../helper-functions/buildChannelName";
import { slackLink, slackQuote } from "../slack-building-blocks";
import { SlackGateway } from "../gateways/SlackGateway";
import getPullRequestDescriptionForSlack from "../helper-functions/getPullRequestDescriptionForSlack";
import { formatUserName } from "../slack-building-blocks/formatUserName";
import { PullRequestModifiedNotification } from "../../typings";
import { getMessageColor } from "../slack-building-blocks/getMessageColor";

export async function sendMessageAboutPRModificationToSlack(payload: PullRequestModifiedNotification, slackGateway: SlackGateway, iconEmoji: string) {
    const pullRequest = payload.pullRequest;
    const changesDescription = getChangesDescription(payload);

    const pleaseReviewText = `Please ${slackLink(pullRequest.links.self[0].href, "review the PR")}`;

    await slackGateway.sendMessage({
        channel: buildChannelName(pullRequest),
        icon_emoji: iconEmoji,
        attachments: [
            {
                title: `${formatUserName(payload.actor)} changed the pull request`,
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

