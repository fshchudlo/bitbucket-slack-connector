import { InMemoryCache } from "./cache/InMemoryCache";

import { PullRequestCommentSnapshot } from "../../use-cases/slack-api-ports";

export const COMMENTS_CACHE = new InMemoryCache<PullRequestCommentSnapshot>("comments");