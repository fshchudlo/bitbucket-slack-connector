import { iconEmoji, link, section, contextBlock } from "./slack-building-blocks";
import { formatUserName } from "./helpers";
import { SendMessageArguments, SlackAPIAdapter } from "../ports/SlackAPIAdapter";
import { PullRequestBasicNotification } from "../../typings";

export async function broadcastMessageAboutOpenedPR(payload: PullRequestBasicNotification, slackAPI: SlackAPIAdapter, defaultChannelParticipants: string[], slackChannelId: string) {
    await slackAPI.sendMessage(buildMessage(payload, slackChannelId));
}

function buildMessage(payload: PullRequestBasicNotification, channelId: string): SendMessageArguments {
    const messageTitle = `:snowboarder: ${formatUserName(payload.actor)} opened pull request "${payload.pullRequest.title}".`;

    const reviewers = payload.pullRequest.reviewers.map(r => formatUserName(r.user));
    const reviewersText = `Assigned reviewers: ${reviewers.join(",")}.`;

    const invitationText = `:open_hands: You're welcome to ${link(payload.pullRequest.links.self[0].href, "join code review")}.`;
    return {
        channelId: channelId,
        iconEmoji: iconEmoji,
        text: messageTitle,
        blocks: [section(messageTitle), contextBlock(reviewersText), section(invitationText)]
    };
}
