export class InMemoryCache<T> {
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

    set(key: string, value: T): void {
        if (!!this.maxCacheSize && this.cache.size >= this.maxCacheSize) {
            const oldestKey = this.cache.keys().next().value;
            this.cache.delete(oldestKey);
            this.pushedOutItemsCounter++;
        }
        this.cache.set(key, value);
    }

    get(key: string): T | undefined {
        return this.cache.get(key);
    }

    delete(key: string): void {
        this.cache.delete(key);
    }

    deleteWhere(matchPredicate: (key: string, value: T) => boolean): void {
        this.cache.forEach((value, key) => {
            if (matchPredicate(key, value)) {
                this.cache.delete(key);
            }
        });
    }
}