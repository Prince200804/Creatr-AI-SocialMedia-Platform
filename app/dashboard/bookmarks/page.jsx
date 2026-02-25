"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Bookmark, Trash2, Eye, Heart, Loader2, BookmarkX } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/convex/_generated/api";
import { useConvexQuery, useConvexMutation } from "@/hooks/use-convex-query";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export default function BookmarksPage() {
  const { data: bookmarksData, isLoading } = useConvexQuery(
    api.bookmarks.getUserBookmarks,
    { limit: 50 }
  );

  const removeBookmark = useConvexMutation(api.bookmarks.removeBookmark);

  const handleRemoveBookmark = async (postId) => {
    try {
      await removeBookmark.mutate({ postId });
      toast.success("Bookmark removed");
    } catch (error) {
      toast.error("Failed to remove bookmark");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-400 mx-auto" />
          <p className="text-slate-400 mt-4">Loading bookmarks...</p>
        </div>
      </div>
    );
  }

  const bookmarks = bookmarksData?.bookmarks || [];

  return (
    <div className="space-y-8 p-4 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text-primary flex items-center gap-3">
            <Bookmark className="h-8 w-8" />
            Saved Posts
          </h1>
          <p className="text-slate-400 mt-2">
            {bookmarks.length} {bookmarks.length === 1 ? "post" : "posts"} saved for later
          </p>
        </div>
      </div>

      {/* Bookmarks Grid */}
      {bookmarks.length === 0 ? (
        <Card className="card-glass">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <BookmarkX className="h-16 w-16 text-slate-500 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No saved posts yet
            </h3>
            <p className="text-slate-400 text-center mb-6 max-w-md">
              When you find interesting posts, click the bookmark icon to save them here for later reading.
            </p>
            <Link href="/feed">
              <Button variant="primary">Discover Posts</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookmarks.map((bookmark) => (
            <Card
              key={bookmark._id}
              className="card-glass hover:border-purple-500/50 transition-all group"
            >
              {/* Featured Image */}
              {bookmark.post.featuredImage && (
                <div className="relative h-40 overflow-hidden rounded-t-xl">
                  <Image
                    src={bookmark.post.featuredImage}
                    alt={bookmark.post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                </div>
              )}

              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <Link
                    href={`/${bookmark.post.author?.username}/${bookmark.post._id}`}
                    className="flex-1"
                  >
                    <CardTitle className="text-lg text-white hover:text-purple-400 transition-colors line-clamp-2">
                      {bookmark.post.title}
                    </CardTitle>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveBookmark(bookmark.post._id)}
                    className="text-slate-400 hover:text-red-400 shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Author */}
                {bookmark.post.author && (
                  <Link
                    href={`/${bookmark.post.author.username}`}
                    className="flex items-center gap-2 group/author"
                  >
                    {bookmark.post.author.imageUrl ? (
                      <Image
                        src={bookmark.post.author.imageUrl}
                        alt={bookmark.post.author.name}
                        width={24}
                        height={24}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-purple-500/30 flex items-center justify-center">
                        <span className="text-xs text-purple-300">
                          {bookmark.post.author.name?.[0]}
                        </span>
                      </div>
                    )}
                    <span className="text-sm text-slate-400 group-hover/author:text-purple-400 transition-colors">
                      {bookmark.post.author.name}
                    </span>
                  </Link>
                )}

                {/* Tags */}
                {bookmark.post.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {bookmark.post.tags.slice(0, 3).map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="bg-slate-700/50 text-slate-300 text-xs"
                      >
                        {tag}
                      </Badge>
                    ))}
                    {bookmark.post.tags.length > 3 && (
                      <Badge
                        variant="secondary"
                        className="bg-slate-700/50 text-slate-400 text-xs"
                      >
                        +{bookmark.post.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-slate-400">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Eye className="h-3.5 w-3.5" />
                      {bookmark.post.viewCount || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="h-3.5 w-3.5" />
                      {bookmark.post.likeCount || 0}
                    </span>
                  </div>
                  <span className="text-xs">
                    Saved{" "}
                    {formatDistanceToNow(new Date(bookmark.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
