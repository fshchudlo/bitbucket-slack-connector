import client, { Counter, Gauge } from "prom-client";

export class InMemoryCache<T> {
    private readonly maxCacheSize?: number;
    private readonly cache: Map<string, any>;
    private readonly utilizedCacheSizeGauge: Gauge;
    private readonly pushedOutItemsCounter: Counter;
    private readonly cacheHitsCounter: Counter;
    private readonly cacheMissesCounter: Counter;

    constructor(metricsNamePrefix: string, maxSize: number) {
        this.cache = new Map<string, any>();
        this.maxCacheSize = maxSize;
        this.cacheHitsCounter = new client.Counter({
            name: `${metricsNamePrefix}_cache_hits`,
            help: "Successful cache hits counter"
        });
        this.cacheMissesCounter = new client.Counter({
            name: `${metricsNamePrefix}_cache_misses`,
            help: "Missed cache hits counter"
        });
        this.pushedOutItemsCounter = new client.Counter({
            name: `${metricsNamePrefix}_cache_pushed_out_items_count`,
            help: "How many items were removed from cache because of it's max size exceeding"
        });
        this.utilizedCacheSizeGauge = new client.Gauge({
            name: `${metricsNamePrefix}_cache_size`,
            help: "Utilized cache size"
        });
        new client.Counter({
            name: `${metricsNamePrefix}_cache_max_size`,
            help: "Maximum size of the cache"
        }).inc(maxSize);
    }

    set(key: string, value: T): void {
        if (!!this.maxCacheSize && this.cache.size >= this.maxCacheSize) {
            const oldestKey = this.cache.keys().next().value;
            this.cache.delete(oldestKey);
            this.utilizedCacheSizeGauge.dec();
            this.pushedOutItemsCounter.inc();
        }
        this.cache.set(key, value);
        this.utilizedCacheSizeGauge.inc();
    }

    get(key: string): T | undefined {
        this.cache.has(key) ? this.cacheHitsCounter.inc() : this.cacheMissesCounter.inc();
        return this.cache.get(key);
    }

    delete(key: string): void {
        this.cache.delete(key);
        this.utilizedCacheSizeGauge.dec();
    }

    deleteWhere(matchPredicate: (key: string, value: T) => boolean): void {
        this.cache.forEach((value, key) => {
            if (matchPredicate(key, value)) {
                this.cache.delete(key);
            }
        });
    }
}