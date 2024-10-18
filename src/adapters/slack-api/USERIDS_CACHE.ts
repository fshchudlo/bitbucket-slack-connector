import { InMemoryCache } from "./cache/InMemoryCache";

export const USERIDS_CACHE = new InMemoryCache<string>("userids");