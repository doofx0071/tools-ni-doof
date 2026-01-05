import { mutation } from "../_generated/server";
import { v } from "convex/values";

const invoiceValidator = v.object({
  status: v.union(v.literal("draft"), v.literal("finalized")),
  invoiceNumber: v.string(),
  issueDate: v.string(),
  dueDate: v.string(),
  logo: v.optional(v.string()),
  sender: v.object({
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    address: v.string(),
  }),
  client: v.object({
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    address: v.string(),
  }),
  items: v.array(v.object({
    id: v.string(),
    description: v.string(),
    quantity: v.number(),
    rate: v.number(),
    taxable: v.boolean(),
    amount: v.number(),
  })),
  currency: v.string(),
  subtotal: v.number(),
  discountType: v.union(v.literal("fixed"), v.literal("percentage")),
  discountValue: v.number(),
  taxLabel: v.string(),
  taxRate: v.number(),
  taxAmount: v.number(),
  total: v.number(),
  notes: v.optional(v.string()),
  terms: v.optional(v.string()),
  template: v.union(
    v.literal("corporate"),
    v.literal("modern"),
    v.literal("classic")
  ),
  primaryColor: v.string(),
});

// Create new invoice
export const create = mutation({
  args: { invoice: invoiceValidator },
  handler: async (ctx, args) => {
    return await ctx.db.insert("invoices", args.invoice);
  },
});

// Update existing invoice
export const update = mutation({
  args: {
    id: v.id("invoices"),
    invoice: invoiceValidator,
  },
  handler: async (ctx, args) => {
    await ctx.db.replace(args.id, args.invoice);
    return args.id;
  },
});

// Finalize invoice (mark as complete)
export const finalize = mutation({
  args: { id: v.id("invoices") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: "finalized" as const });
    return args.id;
  },
});

// Delete invoice
export const remove = mutation({
  args: { id: v.id("invoices") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});