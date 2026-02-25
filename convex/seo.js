import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Save or update SEO metadata for a post
export const saveSeoMetadata = mutation({
  args: {
    postId: v.id("posts"),
    metaDescription: v.optional(v.string()),
    keywords: v.optional(v.array(v.string())),
    socialPreviewText: v.optional(v.string()),
    readingTime: v.optional(v.number()),
    readabilityScore: v.optional(v.number()),
    readabilityLevel: v.optional(v.string()),
    generatedTitles: v.optional(v.array(v.string())),
    tableOfContents: v.optional(
      v.array(
        v.object({
          id: v.string(),
          text: v.string(),
          level: v.number(),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Verify the user owns the post
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("tokenIdentifier"), identity.tokenIdentifier))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    const post = await ctx.db.get(args.postId);
    if (!post) {
      throw new Error("Post not found");
    }

    if (post.authorId !== user._id) {
      throw new Error("Not authorized");
    }

    // Check if SEO record exists
    const existingSeo = await ctx.db
      .query("postSeo")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .unique();

    const now = Date.now();

    const seoData = {
      metaDescription: args.metaDescription,
      keywords: args.keywords || [],
      socialPreviewText: args.socialPreviewText,
      readingTime: args.readingTime,
      readabilityScore: args.readabilityScore,
      readabilityLevel: args.readabilityLevel,
      generatedTitles: args.generatedTitles,
      tableOfContents: args.tableOfContents,
      updatedAt: now,
    };

    if (existingSeo) {
      await ctx.db.patch(existingSeo._id, seoData);
      return existingSeo._id;
    } else {
      const id = await ctx.db.insert("postSeo", {
        postId: args.postId,
        ...seoData,
        createdAt: now,
      });
      return id;
    }
  },
});

// Get SEO metadata for a post
export const getSeoMetadata = query({
  args: {
    postId: v.id("posts"),
  },
  handler: async (ctx, args) => {
    const seo = await ctx.db
      .query("postSeo")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .unique();

    return seo;
  },
});

// Update specific SEO fields
export const updateReadabilityStats = mutation({
  args: {
    postId: v.id("posts"),
    readingTime: v.number(),
    readabilityScore: v.number(),
    readabilityLevel: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const existingSeo = await ctx.db
      .query("postSeo")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .unique();

    const now = Date.now();

    if (existingSeo) {
      await ctx.db.patch(existingSeo._id, {
        readingTime: args.readingTime,
        readabilityScore: args.readabilityScore,
        readabilityLevel: args.readabilityLevel,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("postSeo", {
        postId: args.postId,
        keywords: [],
        readingTime: args.readingTime,
        readabilityScore: args.readabilityScore,
        readabilityLevel: args.readabilityLevel,
        createdAt: now,
        updatedAt: now,
      });
    }

    return { success: true };
  },
});

// Save generated titles
export const saveGeneratedTitles = mutation({
  args: {
    postId: v.id("posts"),
    titles: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const existingSeo = await ctx.db
      .query("postSeo")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .unique();

    const now = Date.now();

    if (existingSeo) {
      await ctx.db.patch(existingSeo._id, {
        generatedTitles: args.titles,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("postSeo", {
        postId: args.postId,
        keywords: [],
        generatedTitles: args.titles,
        createdAt: now,
        updatedAt: now,
      });
    }

    return { success: true };
  },
});

// Save table of contents
export const saveTableOfContents = mutation({
  args: {
    postId: v.id("posts"),
    toc: v.array(
      v.object({
        id: v.string(),
        text: v.string(),
        level: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const existingSeo = await ctx.db
      .query("postSeo")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .unique();

    const now = Date.now();

    if (existingSeo) {
      await ctx.db.patch(existingSeo._id, {
        tableOfContents: args.toc,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("postSeo", {
        postId: args.postId,
        keywords: [],
        tableOfContents: args.toc,
        createdAt: now,
        updatedAt: now,
      });
    }

    return { success: true };
  },
});
