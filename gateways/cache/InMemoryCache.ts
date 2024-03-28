export class InMemoryCache {
    public cacheHits = 0;
    public cacheMisses = 0;
    public readonly maxCacheSize?: number;
    private cache: Map<string, any>;
    private pushedOutItemsCounter: number = 0;

    constructor(maxSize?: number) {
        this.cache = new Map<string, any>();
        this.maxCacheSize = maxSize;
    }

    get cacheSize(): number {
        return this.cache.size;
    }

    get pushedOutItemsCount(): number {
        return this.pushedOutItemsCounter;
    }

    set(key: string, value: any): void {
        if (!!this.maxCacheSize && this.cache.size >= this.maxCacheSize) {
            const oldestKey = this.cache.keys().next().value;
            this.cache.delete(oldestKey);
            this.pushedOutItemsCounter++;
        }
        this.cache.set(key, value);
    }

    get<T>(key: string): T | undefined {
        return this.cache.get(key);
    }

    fetch<T>(key: string, fetchDelegate: () => Promise<T>): Promise<T> {
        const cachedValue = this.get<T>(key);
        if (cachedValue) {
            this.cacheHits++;
            return Promise.resolve(cachedValue);
        }
        const promise = fetchDelegate();
        promise.then(value => {
            this.set(key, value);
            this.cacheMisses++;
        });
        return promise;
    }

    delete(key: string): void {
        this.cache.delete(key);
    }

    deleteWhere<T>(matchPredicate: (entry: T) => boolean): void {
        this.cache.forEach((value, key) => {
            if (matchPredicate(value)) {
                this.cache.delete(key);
            }
        });
    }
}