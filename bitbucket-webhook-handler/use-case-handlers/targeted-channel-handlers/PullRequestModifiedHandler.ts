import { contextBlock, divider, section } from "../utils/slack-building-blocks";
import { formatUserName, formatPullRequestDescription, reviewPRAction } from "../utils";
import { SlackTargetedChannel } from "../../slack-contracts/SlackTargetedChannel";
import { PullRequestModifiedNotification } from "../../../bitbucket-payload-types";
import { WebhookPayloadHandler } from "../../WebhookPayloadHandler";

export class PullRequestModifiedHandler implements WebhookPayloadHandler {
    public canHandle(payload: PullRequestModifiedNotification) {
        return payload.eventKey == "pr:modified";
    }

    public async handle(payload: PullRequestModifiedNotification, slackChannel: SlackTargetedChannel) {
        const visibleChanges = getPRChangesDescription(payload);
        if (visibleChanges.length == 0) {
            return;
        }

        const messageTitle = `:writing_hand: ${formatUserName(payload.actor)} changed the pull request`;
        await slackChannel.sendMessage({
            text: messageTitle,
            blocks: [section(messageTitle), ...visibleChanges, divider(), reviewPRAction(payload.pullRequest)]
        });
    }
}

function getPRChangesDescription(payload: PullRequestModifiedNotification) {
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
