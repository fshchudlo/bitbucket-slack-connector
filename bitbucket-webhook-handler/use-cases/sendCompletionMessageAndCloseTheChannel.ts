import { iconEmoji } from "./slack-building-blocks";
import { SendMessageArguments, SlackChannel } from "../SlackChannel";
import { PullRequestBasicNotification } from "../../bitbucket-payload-types";
import { getPullRequestCompletionAction } from "./helpers/getPullRequestCompletionAction";

export async function sendCompletionMessageAndCloseTheChannel(payload: PullRequestBasicNotification, slackAPI: SlackChannel, slackChannelId: string) {
    await slackAPI.sendMessage(buildMessage(payload, slackChannelId));
    await slackAPI.closeChannel(slackChannelId);
}


function buildMessage(payload: PullRequestBasicNotification, channelId: string): SendMessageArguments {
    const completionAction = getPullRequestCompletionAction(payload);
    return {
        channelId: channelId,
        iconEmoji: iconEmoji,
        text: `${completionAction.emoji} ${completionAction.text}`
    };
}