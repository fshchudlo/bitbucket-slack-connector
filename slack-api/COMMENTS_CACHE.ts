import { InMemoryCache } from "./cache/InMemoryCache";
import { BitbucketCommentSnapshot } from "../bitbucket-webhook-handler/slack-contracts/SlackTargetedChannel";

export const COMMENTS_CACHE = new InMemoryCache<BitbucketCommentSnapshot>("comments");