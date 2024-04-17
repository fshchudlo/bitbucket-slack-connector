import * as useCases from "./use-cases";
import { SlackAPIAdapter } from "./SlackAPIAdapter";
import { BitbucketGateway } from "./BitbucketGateway";
import { BitbucketNotification } from "../typings";
import { buildChannelName } from "./slack-helpers";

export default async function handleBitbucketWebhook(payload: BitbucketNotification, slackAPI: SlackAPIAdapter, bitbucketGateway: BitbucketGateway, usePrivateChannels: boolean = true) {
    const eventKey = payload.eventKey;
    const channelInfo = await provisionPullRequestChannel(slackAPI, payload, usePrivateChannels);

    switch (eventKey) {
        case "pr:opened":
            await useCases.setChannelTopicAndInviteParticipants(payload, slackAPI, channelInfo);
            break;
        case "pr:modified":
            await useCases.sendMessageAboutPRModification(payload, slackAPI, channelInfo);
            break;
        case "pr:reviewer:updated":
            await useCases.updateChannelMembers(payload, slackAPI, channelInfo);
            break;
        case "pr:reviewer:unapproved":
        case "pr:reviewer:needs_work":
        case "pr:reviewer:approved":
            await useCases.sendMessageAboutReviewerAction(payload, slackAPI, channelInfo);
            break;
        case "pr:comment:added":
            await useCases.sendMessageAboutAddedComment(payload, slackAPI, channelInfo);
            break;
        case "pr:comment:edited":
            await useCases.sendMessageAboutEditedComment(payload, slackAPI, channelInfo);
            break;
        case "pr:comment:deleted":
            await useCases.sendMessageAboutDeletedComment(payload, slackAPI, channelInfo);
            break;
        case "pr:from_ref_updated":
            await useCases.sendMessageAboutNewCommit(payload, slackAPI, bitbucketGateway, channelInfo);
            break;
        case "pr:merged":
        case "pr:declined":
        case "pr:deleted":
            await useCases.sendCompletionMessageAndCloseTheChannel(payload, slackAPI, channelInfo);
            break;
        default:
            throw new Error(`"${eventKey}" event key is unknown.`);
    }
}

async function provisionPullRequestChannel(slackAPI: SlackAPIAdapter, payload: BitbucketNotification, usePrivateChannels: boolean) {
    return payload.eventKey == "pr:opened" ? await slackAPI.createChannel({
        name: buildChannelName(payload.pullRequest),
        isPrivate: usePrivateChannels
    }) : await slackAPI.findChannel(buildChannelName(payload.pullRequest), true);
}
