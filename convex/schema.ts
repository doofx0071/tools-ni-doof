import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    webhookEndpoints: defineTable({
        name: v.string(),
        slug: v.string(),
        paused: v.boolean(),
        lastReceivedAt: v.optional(v.number()),
    }).index("by_slug", ["slug"]),

    webhookRequests: defineTable({
        endpointId: v.id("webhookEndpoints"),
        receivedAt: v.number(),
        method: v.string(),
        headers: v.any(),
        query: v.any(),
        rawBody: v.string(),
        jsonBody: v.optional(v.any()),
        truncated: v.boolean(),
        sizeBytes: v.number(),
    }).index("by_endpoint_received", ["endpointId", "receivedAt"]),
});
