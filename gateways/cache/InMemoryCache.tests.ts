import { InMemoryCache } from "./InMemoryCache";

describe("InMemoryCache", () => {
    it("should set and get an item", () => {
        const cache = new InMemoryCache();
        cache.set("key1", "value1");
        expect(cache.get("key1")).toBe("value1");
    });

    it("should delete an item", () => {
        const cache = new InMemoryCache();
        cache.set("key1", "value1");
        cache.delete("key1");
        expect(cache.get("key1")).toBeUndefined();
    });

    it("should respect max cache size", () => {
        const cache = new InMemoryCache(2);
        cache.set("key1", 1);
        cache.set("key2", 2);
        cache.set("key3", 3);
        expect(cache.get("key1")).toBeUndefined();
        expect(cache.get("key2")).toBe(2);
        expect(cache.get("key3")).toBe(3);
    });

    it("should update value for existing key", () => {
        const cache = new InMemoryCache();
        cache.set("key1", "value1");
        cache.set("key1", "value2");
        expect(cache.get("key1")).toBe("value2");
    });

    it("should handle deletion of non-existing item", () => {
        const cache = new InMemoryCache();
        cache.delete("non-existing-key");
    });

    it("deleteWhere should delete item by match delegate", () => {
        const cache = new InMemoryCache();
        cache.set("key1", "value1");
        cache.set("key2", "value2");
        cache.deleteWhere(v => v == "value2");

        expect(cache.get("key1")).toBe("value1");
        expect(cache.get("key2")).toBeUndefined();
    });
});