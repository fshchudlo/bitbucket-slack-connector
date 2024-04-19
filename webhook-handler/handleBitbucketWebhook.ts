import * as useCases from "./use-cases";
import { SlackAPIAdapter } from "./ports/SlackAPIAdapter";
import { BitbucketGateway } from "./ports/BitbucketGateway";
import { BitbucketNotification, PullRequestBasicNotification, PullRequestPayload } from "../typings";
import { buildChannelName } from "./slack-helpers";
import AppConfig from "../app.config";

export default async function handleBitbucketWebhook(payload: BitbucketNotification, slackAPI: SlackAPIAdapter, bitbucketGateway: BitbucketGateway) {
    const eventKey = payload.eventKey;
    let channelInfo = await provisionPullRequestChannel(slackAPI, payload);
    if (channelInfo == null) {
        await replayPullRequestOpenedEvent(payload, slackAPI, bitbucketGateway);
        channelInfo = await provisionPullRequestChannel(slackAPI, payload);
    }

    switch (eventKey) {
        case "pr:opened":
            await useCases.setChannelTopicAndInviteParticipants(payload, slackAPI, AppConfig.DEFAULT_CHANNEL_PARTICIPANTS, channelInfo.id);
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

async function provisionPullRequestChannel(slackAPI: SlackAPIAdapter, payload: BitbucketNotification) {
    const channelName = buildChannelName(payload.pullRequest);
    if (payload.eventKey == "pr:opened") {
        return await slackAPI.createChannel({ name: channelName, isPrivate: AppConfig.USE_PRIVATE_CHANNELS });
    }
    return await slackAPI.findChannel(channelName, true);
}

async function replayPullRequestOpenedEvent(payload: BitbucketNotification, slackAPI: SlackAPIAdapter, bitbucketGateway: BitbucketGateway) {
    const pullRequestPayload = await bitbucketGateway.getPullRequest(payload.pullRequest.toRef.repository.project.key, payload.pullRequest.toRef.repository.slug, payload.pullRequest.id.toString());
    const prOpenedPayload: PullRequestBasicNotification = {
        eventKey: "pr:opened",
        actor: {
            displayName: pullRequestPayload.author.user.displayName,
            emailAddress: pullRequestPayload.author.user.emailAddress
        },
        pullRequest: <PullRequestPayload>pullRequestPayload
    };
    await handleBitbucketWebhook(prOpenedPayload, slackAPI, bitbucketGateway);
}
