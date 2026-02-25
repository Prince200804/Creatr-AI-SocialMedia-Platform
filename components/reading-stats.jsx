"use client";

import React, { useMemo } from "react";
import { Clock, BarChart2, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ReadingStats({ content, showDetailed = false }) {
  const stats = useMemo(() => {
    if (!content) {
      return {
        wordCount: 0,
        readingTime: 0,
        readabilityScore: 0,
        readabilityLevel: "N/A",
      };
    }

    // Strip HTML tags for text analysis
    const textContent = content
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    const words = textContent.split(/\s+/).filter((word) => word.length > 0);
    const wordCount = words.length;
    const sentences = textContent
      .split(/[.!?]+/)
      .filter((s) => s.trim().length > 0);
    const sentenceCount = sentences.length || 1;

    // Calculate reading time (average 200 words per minute)
    const readingTime = Math.ceil(wordCount / 200);

    // Calculate average sentence length
    const avgSentenceLength = wordCount / sentenceCount;

    // Calculate average word length
    const avgWordLength = words.join("").length / (wordCount || 1);

    // Simple readability score (0-100 scale)
    let readabilityScore = 100 - avgSentenceLength * 1.5 - avgWordLength * 10;
    readabilityScore = Math.max(0, Math.min(100, Math.round(readabilityScore)));

    // Determine readability level
    let readabilityLevel;
    let readabilityColor;
    if (readabilityScore >= 70) {
      readabilityLevel = "Easy";
      readabilityColor = "text-green-400";
    } else if (readabilityScore >= 50) {
      readabilityLevel = "Medium";
      readabilityColor = "text-yellow-400";
    } else {
      readabilityLevel = "Advanced";
      readabilityColor = "text-orange-400";
    }

    return {
      wordCount,
      readingTime,
      readabilityScore,
      readabilityLevel,
      readabilityColor,
      sentenceCount,
      avgSentenceLength: Math.round(avgSentenceLength * 10) / 10,
    };
  }, [content]);

  if (!content) return null;

  if (showDetailed) {
    return (
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <div className="flex items-center gap-1.5 text-slate-400">
          <Clock className="h-4 w-4 text-blue-400" />
          <span>{stats.readingTime} min read</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-400">
          <BookOpen className="h-4 w-4 text-purple-400" />
          <span>{stats.wordCount.toLocaleString()} words</span>
        </div>
        <div className="flex items-center gap-1.5">
          <BarChart2 className="h-4 w-4 text-yellow-400" />
          <span className={stats.readabilityColor}>
            {stats.readabilityLevel}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Badge
        variant="secondary"
        className="bg-blue-500/20 text-blue-300 border-blue-500/30"
      >
        <Clock className="h-3 w-3 mr-1" />
        {stats.readingTime} min
      </Badge>
      <Badge
        variant="secondary"
        className={`${
          stats.readabilityLevel === "Easy"
            ? "bg-green-500/20 text-green-300 border-green-500/30"
            : stats.readabilityLevel === "Medium"
              ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
              : "bg-orange-500/20 text-orange-300 border-orange-500/30"
        }`}
      >
        <BarChart2 className="h-3 w-3 mr-1" />
        {stats.readabilityLevel}
      </Badge>
    </div>
  );
}
