import { InMemoryCache } from "../InMemoryCache";
import { register } from "prom-client";

describe("InMemoryCache", () => {
    afterEach(() => {
        register.clear();
    });
    it("should set and get an item", () => {
        const cache = new InMemoryCache("test");
        cache.set("key1", "value1");
        expect(cache.get("key1")).toBe("value1");
    });

    it("should delete an item", () => {
        const cache = new InMemoryCache("test");
        cache.set("key1", "value1");
        cache.delete("key1");
        expect(cache.get("key1")).toBeUndefined();
    });

    it("should update value for existing key", () => {
        const cache = new InMemoryCache("test");
        cache.set("key1", "value1");
        cache.set("key1", "value2");
        expect(cache.get("key1")).toBe("value2");
    });

    it("should handle deletion of non-existing item", () => {
        const cache = new InMemoryCache("test");
        cache.delete("non-existing-key");
    });

    it("deleteWhere should delete item by match delegate", () => {
        const cache = new InMemoryCache("test");
        cache.set("key1", "value1");
        cache.set("key2", "value2");
        cache.deleteWhere((k, v) => v == "value2");

        expect(cache.get("key1")).toBe("value1");
        expect(cache.get("key2")).toBeUndefined();
    });
});