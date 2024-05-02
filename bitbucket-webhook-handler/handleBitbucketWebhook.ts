import * as useCases from "./use-cases";
import { SlackAPIAdapter } from "./ports/SlackAPIAdapter";
import { BitbucketAPIAdapter } from "./ports/BitbucketAPIAdapter";
import { BitbucketNotification } from "../bitbucket-payload-types";
import { WebhookHandlerConfig } from "./webhookHandlerConfig";
import { provisionPullRequestChannel } from "./provisionPullRequestChannel";

export default async function handleBitbucketWebhook(payload: BitbucketNotification, slackAPI: SlackAPIAdapter, bitbucketAPI: BitbucketAPIAdapter, config: WebhookHandlerConfig) {
    const eventKey = payload.eventKey;
    const channelInfo = await provisionPullRequestChannel(slackAPI, bitbucketAPI, payload, config);

    switch (eventKey) {
        case "pr:opened":
            await useCases.inviteParticipantsAndSetChannelBookmark(payload, slackAPI, config.defaultChannelParticipants, channelInfo.id);
            await useCases.tryBroadcastMessageAboutOpenedPR(payload, slackAPI, config.getOpenedPRBroadcastChannelId(payload));
            break;
        case "pr:modified":
            await useCases.sendMessageAboutPRModification(payload, slackAPI, channelInfo.id);
            break;
        case "pr:reviewer:updated":
            await useCases.updateChannelMembers(payload, slackAPI, channelInfo.id);
            break;
        case "pr:reviewer:unapproved":
        case "pr:reviewer:needs_work":
        case "pr:reviewer:approved":
            await useCases.sendMessageAboutReviewerAction(payload, slackAPI, channelInfo.id);
            break;
        case "pr:comment:added":
            await useCases.sendMessageAboutAddedComment(payload, slackAPI, channelInfo.id);
            break;
        case "pr:comment:edited":
            await useCases.sendMessageAboutEditedComment(payload, slackAPI, channelInfo.id);
            break;
        case "pr:comment:deleted":
            await useCases.sendMessageAboutDeletedComment(payload, slackAPI, channelInfo.id);
            break;
        case "pr:from_ref_updated":
            await useCases.sendMessageAboutNewCommit(payload, slackAPI, bitbucketAPI, channelInfo.id);
            break;
        case "pr:merged":
        case "pr:declined":
        case "pr:deleted":
            await useCases.sendCompletionMessageAndCloseTheChannel(payload, slackAPI, channelInfo.id);
            await useCases.tryBroadcastMessageAboutClosedPR(payload, slackAPI, config.getOpenedPRBroadcastChannelId(payload));
            break;
        default:
            throw new Error(`"${eventKey}" event key is unknown.`);
    }
}

