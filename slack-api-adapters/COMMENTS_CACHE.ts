import { InMemoryCache } from "./cache/InMemoryCache";

import { PullRequestCommentSnapshot } from "../bitbucket-webhook-handler/slack-api-ports";

export const COMMENTS_CACHE = new InMemoryCache<PullRequestCommentSnapshot>("comments");