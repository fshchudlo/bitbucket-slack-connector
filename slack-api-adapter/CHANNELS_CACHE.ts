import { InMemoryCache } from "./cache/InMemoryCache";
import { SlackChannelInfo } from "../channel-provisioning/SlackChannelFactory";

export const CHANNELS_CACHE = new InMemoryCache<SlackChannelInfo>("channels");