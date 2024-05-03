import { InMemoryCache } from "./InMemoryCache";
import { BitbucketCommentSnapshot } from "../../bitbucket-webhook-handler/SlackChannel";

export const COMMENTS_CACHE = new InMemoryCache<BitbucketCommentSnapshot>("comments");