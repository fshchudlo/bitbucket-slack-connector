import { PullRequestPayload } from "../../typings";
import { SlackAPIAdapter, SlackChannelInfo } from "../SlackAPIAdapter";
import { buildChannelName } from "./buildChannelName";

export function findPullRequestChannel(slackAPI: SlackAPIAdapter, payload: PullRequestPayload): Promise<SlackChannelInfo | null> {
    return slackAPI.findChannel(buildChannelName(payload), true);
}