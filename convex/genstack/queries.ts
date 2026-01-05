import { query } from "../_generated/server";
import { v } from "convex/values";

// Get current draft (most recent draft invoice)
export const getDraft = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("invoices")
      .withIndex("by_status", (q) => q.eq("status", "draft"))
      .order("desc")
      .first();
  },
});

// Get invoice by ID
export const getById = query({
  args: { id: v.id("invoices") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get invoice history (last 20 finalized invoices)
export const getHistory = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("invoices")
      .withIndex("by_status", (q) => q.eq("status", "finalized"))
      .order("desc")
      .take(20);
  },
});