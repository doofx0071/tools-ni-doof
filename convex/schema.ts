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

    // Invoice Generator
    invoices: defineTable({
        status: v.union(v.literal("draft"), v.literal("finalized")),
        invoiceNumber: v.string(),
        issueDate: v.string(),
        dueDate: v.string(),

        // Logo stored as data URL for simplicity
        logo: v.optional(v.string()),

        // Sender
        sender: v.object({
            name: v.string(),
            email: v.string(),
            phone: v.string(),
            address: v.string(),
        }),

        // Client
        client: v.object({
            name: v.string(),
            email: v.string(),
            phone: v.string(),
            address: v.string(),
        }),

        // Items
        items: v.array(v.object({
            id: v.string(),
            description: v.string(),
            quantity: v.number(),
            rate: v.number(),
            taxable: v.boolean(),
            amount: v.number(),
        })),

        // Pricing
        currency: v.string(),
        subtotal: v.number(),
        discountType: v.union(v.literal("fixed"), v.literal("percentage")),
        discountValue: v.number(),
        taxLabel: v.string(),
        taxRate: v.number(),
        taxAmount: v.number(),
        total: v.number(),

        // Notes
        notes: v.optional(v.string()),
        terms: v.optional(v.string()),

        // Template
        template: v.union(
            v.literal("corporate"),
            v.literal("modern"),
            v.literal("classic")
        ),
        primaryColor: v.string(),
    })
        .index("by_status", ["status"])
        .index("by_invoice_number", ["invoiceNumber"]),
});
