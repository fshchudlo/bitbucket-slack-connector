import { iconEmoji } from "./slack-building-blocks";
import { SendMessageArguments, SlackChannel } from "../SlackChannel";
import { PullRequestBasicNotification } from "../../bitbucket-payload-types";
import { getPullRequestCompletionAction } from "./helpers/getPullRequestCompletionAction";

export async function sendCompletionMessageAndCloseTheChannel(payload: PullRequestBasicNotification, slackAPI: SlackChannel) {
    await slackAPI.sendMessage(buildMessage(payload));
    await slackAPI.closeChannel();
}


function buildMessage(payload: PullRequestBasicNotification): SendMessageArguments {
    const completionAction = getPullRequestCompletionAction(payload);
    return {
        iconEmoji: iconEmoji,
        text: `${completionAction.emoji} ${completionAction.text}`
    };
}