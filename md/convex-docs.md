# Convex Comprehensive Guide (TypeScript)

## 1. Schema Definition (`convex/schema.ts`)
Convex requires a schema for type safety. It uses `defineSchema` and `defineTable` with validators (`v`).

### 1.1 Validators
- `v.string()`: String values
- `v.number()`: Floating point numbers
- `v.boolean()`: True/False
- `v.id("tableName")`: A reference to a document in another table
- `v.array(v.string())`: Lists
- `v.object({})`: Nested objects
- `v.optional(v.string())`: Fields that might be undefined
- `v.any()`: Bypass validation (discouraged)

### 1.2 Example Schema
```ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    tokenIdentifier: v.string(),
  }).index("by_token", ["tokenIdentifier"]),
  
  messages: defineTable({
    body: v.string(),
    userId: v.id("users"),
    format: v.string(),
  })
  .index("by_user", ["userId"])
  .searchIndex("search_body", {
    searchField: "body",
    filterFields: ["userId"],
  }),
});
```

## 2. Reading Data (Queries)
Queries are pure functions that read the database. They are **reactive** by default.

### 2.1 Basic Query
```ts
import { query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: { limit: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db.query("messages").take(args.limit);
  },
});
```

### 2.2 Relational Query (Joins)
Convex doesn't support SQL joins. You fetch IDs and then fetch the related documents.
```ts
export const listWithUser = query({
  handler: async (ctx) => {
    const messages = await ctx.db.query("messages").collect();
    return Promise.all(
      messages.map(async (msg) => {
        const user = await ctx.db.get(msg.userId);
        return { ...msg, author: user?.name };
      })
    );
  },
});
```

### 2.3 Pagination
```ts
export const listPaginated = query({
  args: { paginationOpts: v.any() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .order("desc")
      .paginate(args.paginationOpts);
  },
});
```

## 3. Writing Data (Mutations)
Mutations change the database state. They are transactional.

### 3.1 Insert, Patch, Delete
```ts
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const sendMessage = mutation({
  args: { body: v.string(), userId: v.id("users") },
  handler: async (ctx, args) => {
    // Insert
    const loadId = await ctx.db.insert("messages", {
      body: args.body,
      userId: args.userId,
      format: "text",
    });
    
    // Patch (Update)
    await ctx.db.patch(loadId, { format: "markdown" });
    
    // Delete
    // await ctx.db.delete(loadId);
  },
});
```

## 4. File Storage
Convex has built-in file storage.

### 4.1 Storing Files
```ts
export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});
// Client then POSTs to this URL
```

### 4.2 Serving Files
```ts
export const getImageUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});
```

## 5. Full Text Search
```ts
export const search = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withSearchIndex("search_body", (q) => 
        q.search("body", args.query)
      )
      .collect();
  },
});
```

## 6. Authentication
Use `ctx.auth` to handle user identity.

```ts
export const getMyProfile = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => 
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();
      
    return user;
  },
});
```
