import { contextBlock, divider, iconEmoji, section } from "./slack-building-blocks";
import { formatUserName, formatPullRequestDescription, reviewPRAction } from "./helpers";
import { SlackChannel } from "../SlackChannel";
import { PullRequestModifiedNotification } from "../../bitbucket-payload-types";

export async function sendMessageAboutPRModification(payload: PullRequestModifiedNotification, slackAPI: SlackChannel) {
    const visibleChanges = getChangesDescription(payload);
    if (visibleChanges.length == 0) {
        return;
    }

    const messageTitle = `:writing_hand: ${formatUserName(payload.actor)} changed the pull request`;

    await slackAPI.sendMessage({
        iconEmoji: iconEmoji,
        text: messageTitle,
        blocks: [section(messageTitle), ...visibleChanges, divider(), reviewPRAction(payload.pullRequest)]
    });
}

function getChangesDescription(payload: PullRequestModifiedNotification) {
    const changesDescription = new Array<any>();
    const addDivider = () => {
        if (changesDescription.length > 0) {
            changesDescription.push(divider());
        }
    };
    const pullRequest = payload.pullRequest;

    if (pullRequest.toRef.displayId != payload.previousTarget.displayId) {
        addDivider();
        changesDescription.push(section(`Target is changed to \`${pullRequest.toRef.displayId}\``));
    }
    if (pullRequest.title != payload.previousTitle) {
        addDivider();
        changesDescription.push(section(`Updated title:`));
        changesDescription.push(contextBlock(pullRequest.title));
    }
    if (pullRequest.description != payload.previousDescription) {
        addDivider();
        if (pullRequest.description) {
            changesDescription.push(section("Updated description:"));
            changesDescription.push(contextBlock(formatPullRequestDescription(pullRequest.description)));
        } else {
            changesDescription.push(section("Description is deleted."));
        }
    }
    return changesDescription;
}

