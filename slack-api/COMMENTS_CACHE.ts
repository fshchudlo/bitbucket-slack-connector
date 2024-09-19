import { InMemoryCache } from "./cache/InMemoryCache";

import { PullRequestCommentSnapshot } from "../types/slack-contracts";

export const COMMENTS_CACHE = new InMemoryCache<PullRequestCommentSnapshot>("comments");