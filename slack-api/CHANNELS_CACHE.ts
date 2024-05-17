import { InMemoryCache } from "./cache/InMemoryCache";
import { SlackChannelInfo } from "./slack-channel-factory/SlackChannelFactory";

export const CHANNELS_CACHE = new InMemoryCache<SlackChannelInfo>("channels");