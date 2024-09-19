import { InMemoryCache } from "./cache/InMemoryCache";

import { BitbucketCommentSnapshot } from "../types/slack-contracts";

export const COMMENTS_CACHE = new InMemoryCache<BitbucketCommentSnapshot>("comments");