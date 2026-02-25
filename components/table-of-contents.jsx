"use client";

import React, { useState, useEffect } from "react";
import { List, ChevronDown, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function TableOfContents({ content, className = "" }) {
  const [toc, setToc] = useState([]);
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeId, setActiveId] = useState("");

  // Extract headings from HTML content
  useEffect(() => {
    if (!content) return;

    const headingRegex = /<h([1-3])[^>]*>(.*?)<\/h[1-3]>/gi;
    const headings = [];
    let match;
    let index = 0;

    while ((match = headingRegex.exec(content)) !== null) {
      const level = parseInt(match[1]);
      const text = match[2].replace(/<[^>]*>/g, "").trim();

      if (text) {
        headings.push({
          id: `toc-heading-${index}`,
          text: text,
          level: level,
        });
        index++;
      }
    }

    setToc(headings);
  }, [content]);

  // Handle scroll to heading
  const scrollToHeading = (id, text) => {
    // Find the heading by text content since we can't add IDs to the server-rendered content
    const headings = document.querySelectorAll("h1, h2, h3");
    const targetHeading = Array.from(headings).find(
      (h) => h.textContent.trim() === text
    );

    if (targetHeading) {
      targetHeading.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveId(id);

      // Add a brief highlight effect
      targetHeading.classList.add("highlight-heading");
      setTimeout(() => {
        targetHeading.classList.remove("highlight-heading");
      }, 2000);
    }
  };

  if (toc.length === 0) {
    return null;
  }

  return (
    <Card className={`card-glass ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
            <List className="h-4 w-4 text-purple-400" />
            Table of Contents
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-6 w-6 p-0 text-slate-400"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          <nav className="space-y-1">
            {toc.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToHeading(item.id, item.text)}
                className={`
                  block w-full text-left text-sm transition-colors
                  hover:text-purple-400 cursor-pointer
                  ${item.level === 1 ? "pl-0 font-medium" : ""}
                  ${item.level === 2 ? "pl-4" : ""}
                  ${item.level === 3 ? "pl-8 text-xs" : ""}
                  ${
                    activeId === item.id
                      ? "text-purple-400 border-l-2 border-purple-400 pl-2"
                      : "text-slate-400"
                  }
                `}
                style={{
                  paddingTop: "4px",
                  paddingBottom: "4px",
                }}
              >
                {item.text}
              </button>
            ))}
          </nav>
        </CardContent>
      )}
    </Card>
  );
}
