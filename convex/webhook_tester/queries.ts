import { v } from "convex/values";
import { query, internalQuery } from "../_generated/server";

export const listEndpoints = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("webhookEndpoints")
      .order("desc")
      .collect();
  },
});

export const getEndpoint = query({
  args: { endpointId: v.id("webhookEndpoints") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.endpointId);
  },
});

export const getEndpointBySlug = internalQuery({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("webhookEndpoints")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});

export const listRequests = query({
  args: {
    endpointId: v.id("webhookEndpoints"),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()) // Pagination cursor
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;
    const requests = await ctx.db
      .query("webhookRequests")
      .withIndex("by_endpoint_received", (q) => q.eq("endpointId", args.endpointId))
      .order("desc")
      .paginate({ cursor: args.cursor ?? null, numItems: limit });

    return requests;
  },
});

export const getRequest = query({
  args: { requestId: v.id("webhookRequests") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.requestId);
  },
});