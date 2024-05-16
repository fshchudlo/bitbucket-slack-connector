import { SendMessageArguments, SlackChannel } from "../SlackChannel";
import { PullRequestBasicNotification } from "../../bitbucket-payload-types";
import { getPullRequestCompletionAction } from "./helpers/getPullRequestCompletionAction";

export async function sendCompletionMessageAndCloseTheChannel(payload: PullRequestBasicNotification, slackChannel: SlackChannel) {
    await slackChannel.sendMessage(buildMessage(payload));
    await slackChannel.closeChannel();
}


function buildMessage(payload: PullRequestBasicNotification): SendMessageArguments {
    const completionAction = getPullRequestCompletionAction(payload);
    return {
        text: `${completionAction.emoji} ${completionAction.text}`
    };
}