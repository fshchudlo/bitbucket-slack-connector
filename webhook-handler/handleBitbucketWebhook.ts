import * as useCases from "./use-cases";
import { SlackAPIAdapter } from "./ports/SlackAPIAdapter";
import { BitbucketGateway } from "./ports/BitbucketGateway";
import { BitbucketNotification } from "../typings";
import { buildChannelName } from "./slack-helpers";

export default async function handleBitbucketWebhook(payload: BitbucketNotification, slackAPI: SlackAPIAdapter, bitbucketGateway: BitbucketGateway, usePrivateChannels: boolean = true, defaultChannelParticipants: string[] = null) {
    const eventKey = payload.eventKey;
    const channelInfo = await provisionPullRequestChannel(slackAPI, payload, usePrivateChannels);

    switch (eventKey) {
        case "pr:opened":
            await useCases.setChannelTopicAndInviteParticipants(payload, slackAPI, defaultChannelParticipants, channelInfo.id);
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
            await useCases.sendMessageAboutNewCommit(payload, slackAPI, bitbucketGateway, channelInfo.id);
            break;
        case "pr:merged":
        case "pr:declined":
        case "pr:deleted":
            await useCases.sendCompletionMessageAndCloseTheChannel(payload, slackAPI, channelInfo.id);
            break;
        default:
            throw new Error(`"${eventKey}" event key is unknown.`);
    }
}

async function provisionPullRequestChannel(slackAPI: SlackAPIAdapter, payload: BitbucketNotification, usePrivateChannels: boolean) {
    const channelName = buildChannelName(payload.pullRequest);
    if (payload.eventKey == "pr:opened") {
        return await slackAPI.createChannel({ name: channelName, isPrivate: usePrivateChannels });
    }
    const channel = await slackAPI.findChannel(channelName, true);
    if (channel == null) {
        throw new Error(`Channel ${channelName} doesn't exist`);
    }
    return channel;
}
