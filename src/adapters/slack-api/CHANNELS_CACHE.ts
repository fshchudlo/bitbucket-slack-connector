import { InMemoryCache } from "./cache/InMemoryCache";
import { SlackChannelInfo } from "./SlackChannelProvisioner";

export const CHANNELS_CACHE = new InMemoryCache<SlackChannelInfo>("channels");