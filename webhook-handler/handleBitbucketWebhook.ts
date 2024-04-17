import {
    sendCompletionMessageAndCloseTheChannel,
    setChannelTopicAndInviteParticipants,
    sendMessageAboutAddedComment,
    updateChannelMembers,
    sendMessageAboutNewCommit,
    sendMessageAboutReviewerAction,
    sendMessageAboutDeletedComment, sendMessageAboutEditedComment
} from "./use-cases";
import { SlackAPIAdapter } from "./SlackAPIAdapter";
import { BitbucketGateway } from "./BitbucketGateway";
import { sendMessageAboutPRModification } from "./use-cases/sendMessageAboutPRModification";
import { BitbucketNotification } from "../typings";
import { buildChannelName } from "./slack-helpers";

export default async function handleBitbucketWebhook(payload: BitbucketNotification, slackAPI: SlackAPIAdapter, bitbucketGateway: BitbucketGateway, usePrivateChannels: boolean = true) {
    const eventKey = payload.eventKey;
    const channelInfo = await provisionPullRequestChannel(slackAPI, payload, usePrivateChannels);
    switch (eventKey) {
        case "pr:opened":
            await setChannelTopicAndInviteParticipants(payload, slackAPI, channelInfo);
            break;
        case "pr:modified":
            await sendMessageAboutPRModification(payload, slackAPI, channelInfo);
            break;
        case "pr:reviewer:updated":
            await updateChannelMembers(payload, slackAPI, channelInfo);
            break;
        case "pr:reviewer:unapproved":
        case "pr:reviewer:needs_work":
        case "pr:reviewer:approved":
            await sendMessageAboutReviewerAction(payload, slackAPI, channelInfo);
            break;
        case "pr:comment:added":
            await sendMessageAboutAddedComment(payload, slackAPI, channelInfo);
            break;
        case "pr:comment:edited":
            await sendMessageAboutEditedComment(payload, slackAPI, channelInfo);
            break;
        case "pr:comment:deleted":
            await sendMessageAboutDeletedComment(payload, slackAPI, channelInfo);
            break;
        case "pr:from_ref_updated":
            await sendMessageAboutNewCommit(payload, slackAPI, bitbucketGateway, channelInfo);
            break;
        case "pr:merged":
        case "pr:declined":
        case "pr:deleted":
            await sendCompletionMessageAndCloseTheChannel(payload, slackAPI, channelInfo);
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
