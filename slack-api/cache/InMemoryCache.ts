import client, { Counter, Gauge } from "prom-client";

export class InMemoryCache<T> {
    private readonly cache: Map<string, any>;
    private readonly utilizedCacheSizeGauge: Gauge;
    private readonly cacheHitsCounter: Counter;
    private readonly cacheMissesCounter: Counter;

    constructor(metricsNamePrefix: string) {
        this.cache = new Map<string, any>();
        this.cacheHitsCounter = new client.Counter({
            name: `${metricsNamePrefix}_cache_hits`,
            help: "Successful cache hits counter"
        });
        this.cacheMissesCounter = new client.Counter({
            name: `${metricsNamePrefix}_cache_misses`,
            help: "Missed cache hits counter"
        });
        this.utilizedCacheSizeGauge = new client.Gauge({
            name: `${metricsNamePrefix}_cache_utilized_size`,
            help: "Utilized cache size"
        });
    }

    set(key: string, value: T): void {
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