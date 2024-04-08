import client from "prom-client";
import { SlackGatewayCachedDecorator } from "./gateways/SlackGatewayCachedDecorator";

export default function configureMetrics(slackGateway: SlackGatewayCachedDecorator) {
    new client.Gauge({
        name: "channel_names_cache_hits",
        help: "Successful cache hits counter",
        collect: function() {
            this.set(slackGateway.channelsCacheHits);
        }
    });
    new client.Gauge({
        name: "channel_names_cache_misses",
        help: "Missed cache hits counter",
        collect: function() {
            this.set(slackGateway.channelsCacheMisses);
        }
    });
    new client.Gauge({
        name: "channel_names_cache_max_size",
        help: "Maximum size of the cache",
        collect: function() {
            this.set(slackGateway.channelsCache.maxCacheSize);
        }
    });
    new client.Gauge({
        name: "channel_names_cache_size",
        help: "Utilized cache size",
        collect: function() {
            this.set(slackGateway.channelsCache.cacheSize);
        }
    });
    new client.Gauge({
        name: "channel_names_cache_pushed_out_items_count",
        help: "How many items were removed from cache because of it's max size exceeding",
        collect: function() {
            this.set(slackGateway.channelsCache.pushedOutItemsCount);
        }
    });

    new client.Gauge({
        name: "bitbucket_comments_cache_hits",
        help: "Successful cache hits counter",
        collect: function() {
            this.set(slackGateway.bitbucketCommentsCacheHits);
        }
    });
    new client.Gauge({
        name: "bitbucket_comments_cache_misses",
        help: "Missed cache hits counter",
        collect: function() {
            this.set(slackGateway.bitbucketCommentsCacheMisses);
        }
    });
    new client.Gauge({
        name: "bitbucket_comments_cache_max_size",
        help: "Maximum size of the cache",
        collect: function() {
            this.set(slackGateway.bitbucketCommentsCache.maxCacheSize);
        }
    });
    new client.Gauge({
        name: "bitbucket_comments_cache_size",
        help: "Utilized cache size",
        collect: function() {
            this.set(slackGateway.bitbucketCommentsCache.cacheSize);
        }
    });
    new client.Gauge({
        name: "bitbucket_comments_cache_pushed_out_items_count",
        help: "How many items were removed from cache because of it's max size exceeding",
        collect: function() {
            this.set(slackGateway.bitbucketCommentsCache.pushedOutItemsCount);
        }
    });
}