import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Toggle bookmark (add/remove)
export const toggleBookmark = mutation({
  args: {
    postId: v.id("posts"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get user from database
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("tokenIdentifier"), identity.tokenIdentifier))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Check if bookmark already exists
    const existingBookmark = await ctx.db
      .query("bookmarks")
      .withIndex("by_user_post", (q) =>
        q.eq("userId", user._id).eq("postId", args.postId)
      )
      .unique();

    if (existingBookmark) {
      // Remove bookmark
      await ctx.db.delete(existingBookmark._id);
      return { bookmarked: false };
    } else {
      // Add bookmark
      await ctx.db.insert("bookmarks", {
        userId: user._id,
        postId: args.postId,
        createdAt: Date.now(),
      });
      return { bookmarked: true };
    }
  },
});

// Check if user has bookmarked a post
export const hasBookmarked = query({
  args: {
    postId: v.id("posts"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return false;
    }

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("tokenIdentifier"), identity.tokenIdentifier))
      .unique();

    if (!user) {
      return false;
    }

    const bookmark = await ctx.db
      .query("bookmarks")
      .withIndex("by_user_post", (q) =>
        q.eq("userId", user._id).eq("postId", args.postId)
      )
      .unique();

    return !!bookmark;
  },
});

// Get all bookmarks for current user
export const getUserBookmarks = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { bookmarks: [], hasMore: false };
    }

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("tokenIdentifier"), identity.tokenIdentifier))
      .unique();

    if (!user) {
      return { bookmarks: [], hasMore: false };
    }

    const limit = args.limit || 20;

    const bookmarks = await ctx.db
      .query("bookmarks")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(limit + 1);

    const hasMore = bookmarks.length > limit;
    const bookmarkList = hasMore ? bookmarks.slice(0, limit) : bookmarks;

    // Get post details for each bookmark
    const bookmarksWithPosts = await Promise.all(
      bookmarkList.map(async (bookmark) => {
        const post = await ctx.db.get(bookmark.postId);
        if (!post || post.status !== "published") {
          return null;
        }

        const author = await ctx.db.get(post.authorId);

        return {
          ...bookmark,
          post: {
            ...post,
            author: author
              ? {
                  _id: author._id,
                  name: author.name,
                  username: author.username,
                  imageUrl: author.imageUrl,
                }
              : null,
          },
        };
      })
    );

    return {
      bookmarks: bookmarksWithPosts.filter((b) => b !== null),
      hasMore,
    };
  },
});

// Get bookmark count for a post
export const getBookmarkCount = query({
  args: {
    postId: v.id("posts"),
  },
  handler: async (ctx, args) => {
    const bookmarks = await ctx.db
      .query("bookmarks")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .collect();

    return bookmarks.length;
  },
});

// Remove bookmark
export const removeBookmark = mutation({
  args: {
    postId: v.id("posts"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("tokenIdentifier"), identity.tokenIdentifier))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    const bookmark = await ctx.db
      .query("bookmarks")
      .withIndex("by_user_post", (q) =>
        q.eq("userId", user._id).eq("postId", args.postId)
      )
      .unique();

    if (bookmark) {
      await ctx.db.delete(bookmark._id);
    }

    return { success: true };
  },
});
