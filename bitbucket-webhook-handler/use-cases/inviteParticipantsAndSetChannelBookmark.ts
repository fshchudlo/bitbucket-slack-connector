import { iconEmoji, link, section, divider, contextBlock } from "./slack-building-blocks";
import { formatUserName, formatPullRequestDescription, reviewPRAction } from "./helpers";
import { SendMessageArguments, SlackChannel } from "../SlackChannel";
import { PullRequestBasicNotification } from "../../bitbucket-payload-types";

export async function inviteParticipantsAndSetChannelBookmark(payload: PullRequestBasicNotification, slackAPI: SlackChannel, defaultChannelParticipants: string[], slackChannelId: string) {
    const allParticipants = [payload.pullRequest.author.user]
        .concat(payload.pullRequest.reviewers.map(r => r.user));

    const slackUserIds = (await slackAPI.getSlackUserIds(allParticipants.map(payload => payload.emailAddress))).concat(defaultChannelParticipants ?? []);

    if (slackUserIds.length > 0) {
        await slackAPI.inviteToChannel({ channelId: slackChannelId, users: slackUserIds, force: true });
    }
    await slackAPI.addBookmark({
        channelId: slackChannelId,
        link: payload.pullRequest.links.self[0].href,
        emoji: ":git:",
        title: "Review Pull Request"
    });

    await slackAPI.sendMessage(buildMessage(payload, slackChannelId));
}

function buildMessage(payload: PullRequestBasicNotification, channelId: string): SendMessageArguments {
    const messageTitle = `${formatUserName(payload.actor)} opened ${link(payload.pullRequest.links.self[0].href, "pull request")}`;
    const descriptionText = formatPullRequestDescription(payload.pullRequest.description ?? payload.pullRequest.title);
    return {
        channelId: channelId,
        iconEmoji: iconEmoji,
        text: messageTitle,
        blocks: [section(messageTitle), divider(), contextBlock(descriptionText), divider(), reviewPRAction(payload.pullRequest)]
    };
}
