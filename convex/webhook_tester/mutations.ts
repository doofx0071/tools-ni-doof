import { v } from "convex/values";
import { mutation, internalMutation } from "../_generated/server";

// Helper to generate a random slug
const generateSlug = () => Math.random().toString(36).substring(2, 10);

export const createEndpoint = mutation({
    args: { name: v.optional(v.string()) },
    handler: async (ctx, args) => {
        const slug = generateSlug();
        const endpointId = await ctx.db.insert("webhookEndpoints", {
            name: args.name ?? "Untitled Endpoint",
            slug,
            paused: false,
        });
        return { endpointId, slug };
    },
});

export const updateEndpoint = mutation({
    args: {
        endpointId: v.id("webhookEndpoints"),
        name: v.optional(v.string()),
        paused: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const fields: Partial<{ name: string; paused: boolean }> = {};
        if (args.name !== undefined) fields.name = args.name;
        if (args.paused !== undefined) fields.paused = args.paused;

        await ctx.db.patch(args.endpointId, fields);
    },
});

export const deleteEndpoint = mutation({
    args: { endpointId: v.id("webhookEndpoints") },
    handler: async (ctx, args) => {
        // Cascade delete requests
        // Note: If there are many requests, this might timeout.
        // For MVP, simplistic iteration is fine.
        const requests = await ctx.db
            .query("webhookRequests")
            .withIndex("by_endpoint_received", (q) => q.eq("endpointId", args.endpointId))
            .collect();

        for (const req of requests) {
            await ctx.db.delete(req._id);
        }

        await ctx.db.delete(args.endpointId);
    },
});

export const clearRequests = mutation({
    args: { endpointId: v.id("webhookEndpoints") },
    handler: async (ctx, args) => {
        const requests = await ctx.db
            .query("webhookRequests")
            .withIndex("by_endpoint_received", (q) => q.eq("endpointId", args.endpointId))
            .collect();

        for (const req of requests) {
            await ctx.db.delete(req._id);
        }
    },
});

// Internal mutation called by the HTTP action to log the request
export const logRequest = internalMutation({
    args: {
        endpointId: v.id("webhookEndpoints"),
        receivedAt: v.number(),
        method: v.string(),
        headers: v.any(),
        query: v.any(),
        rawBody: v.string(),
        jsonBody: v.optional(v.any()),
        truncated: v.boolean(),
        sizeBytes: v.number(),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("webhookRequests", args);
        // Update lastReceivedAt
        await ctx.db.patch(args.endpointId, { lastReceivedAt: args.receivedAt });
    },
});
