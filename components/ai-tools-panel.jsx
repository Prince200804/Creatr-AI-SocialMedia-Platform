"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Search,
  Type,
  BarChart2,
  Lightbulb,
  Loader2,
  Copy,
  Check,
  RefreshCw,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  generateSeoMetadata,
  generateTitleVariations,
  analyzeContentReadability,
  generateContentInsights,
} from "@/app/actions/gemini";

export default function AIToolsPanel({
  title,
  content,
  onTitleSelect,
  onKeywordsUpdate,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("seo");
  const [isLoading, setIsLoading] = useState(false);
  const [seoData, setSeoData] = useState(null);
  const [titles, setTitles] = useState([]);
  const [readabilityData, setReadabilityData] = useState(null);
  const [insights, setInsights] = useState(null);
  const [copiedItem, setCopiedItem] = useState(null);

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(id);
    setTimeout(() => setCopiedItem(null), 2000);
    toast.success("Copied to clipboard!");
  };

  const generateSEO = async () => {
    if (!title || !content) {
      toast.error("Add title and content first");
      return;
    }

    setIsLoading(true);
    try {
      const result = await generateSeoMetadata(title, content);
      if (result.success) {
        setSeoData(result.data);
        toast.success("SEO metadata generated!");
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Failed to generate SEO metadata");
    } finally {
      setIsLoading(false);
    }
  };

  const generateTitles = async () => {
    if (!title) {
      toast.error("Add a title first");
      return;
    }

    setIsLoading(true);
    try {
      const result = await generateTitleVariations(title, content);
      if (result.success) {
        setTitles(result.titles);
        toast.success("Title variations generated!");
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Failed to generate titles");
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeReadability = async () => {
    if (!content) {
      toast.error("Add content first");
      return;
    }

    setIsLoading(true);
    try {
      const result = await analyzeContentReadability(content);
      if (result.success) {
        setReadabilityData(result.data);
        toast.success("Content analyzed!");
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Failed to analyze content");
    } finally {
      setIsLoading(false);
    }
  };

  const getInsights = async () => {
    if (!title || !content) {
      toast.error("Add title and content first");
      return;
    }

    setIsLoading(true);
    try {
      const result = await generateContentInsights(title, content);
      if (result.success) {
        setInsights(result.insights);
        toast.success("Insights generated!");
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Failed to generate insights");
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: "seo", label: "SEO", icon: Search },
    { id: "titles", label: "Titles", icon: Type },
    { id: "readability", label: "Analysis", icon: BarChart2 },
    { id: "insights", label: "Insights", icon: Lightbulb },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="border-purple-500/50 text-purple-400 hover:bg-purple-500/20"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          AI Tools
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Sparkles className="h-5 w-5 text-purple-400" />
            AI Writing Tools
          </DialogTitle>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-700 pb-4">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "primary" : "ghost"}
              size="sm"
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2"
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="mt-4 space-y-4">
          {/* SEO Tab */}
          {activeTab === "seo" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-400">
                  Generate SEO-optimized metadata for your post
                </p>
                <Button
                  onClick={generateSEO}
                  disabled={isLoading}
                  variant="primary"
                  size="sm"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Generate
                    </>
                  )}
                </Button>
              </div>

              {seoData && (
                <div className="space-y-4">
                  {/* Meta Description */}
                  <Card className="bg-slate-800 border-slate-700">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-slate-300">
                        Meta Description
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm text-white">
                          {seoData.metaDescription}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleCopy(seoData.metaDescription, "meta")
                          }
                        >
                          {copiedItem === "meta" ? (
                            <Check className="h-4 w-4 text-green-400" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Keywords */}
                  <Card className="bg-slate-800 border-slate-700">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-slate-300">
                        Keywords
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {seoData.keywords?.map((keyword, i) => (
                          <Badge
                            key={i}
                            variant="secondary"
                            className="bg-purple-500/20 text-purple-300 border-purple-500/30"
                          >
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Social Preview */}
                  <Card className="bg-slate-800 border-slate-700">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-slate-300">
                        Social Media Preview
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm text-white">
                          {seoData.socialPreviewText}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleCopy(seoData.socialPreviewText, "social")
                          }
                        >
                          {copiedItem === "social" ? (
                            <Check className="h-4 w-4 text-green-400" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}

          {/* Titles Tab */}
          {activeTab === "titles" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-400">
                  Generate catchy title variations for your post
                </p>
                <Button
                  onClick={generateTitles}
                  disabled={isLoading}
                  variant="primary"
                  size="sm"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Generate
                    </>
                  )}
                </Button>
              </div>

              {titles.length > 0 && (
                <div className="space-y-2">
                  {titles.map((t, i) => (
                    <Card
                      key={i}
                      className="bg-slate-800 border-slate-700 hover:border-purple-500/50 cursor-pointer transition-colors"
                      onClick={() => {
                        if (onTitleSelect) {
                          onTitleSelect(t);
                          setIsOpen(false);
                        }
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <p className="text-white">{t}</p>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopy(t, `title-${i}`);
                              }}
                            >
                              {copiedItem === `title-${i}` ? (
                                <Check className="h-4 w-4 text-green-400" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                            <Badge
                              variant="secondary"
                              className="bg-green-500/20 text-green-300 text-xs"
                            >
                              Click to use
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Readability Tab */}
          {activeTab === "readability" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-400">
                  Analyze your content's readability
                </p>
                <Button
                  onClick={analyzeReadability}
                  disabled={isLoading}
                  variant="primary"
                  size="sm"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <BarChart2 className="h-4 w-4 mr-2" />
                      Analyze
                    </>
                  )}
                </Button>
              </div>

              {readabilityData && (
                <div className="grid grid-cols-2 gap-4">
                  <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-4 text-center">
                      <p className="text-3xl font-bold text-purple-400">
                        {readabilityData.wordCount}
                      </p>
                      <p className="text-sm text-slate-400">Words</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-4 text-center">
                      <p className="text-3xl font-bold text-blue-400">
                        {readabilityData.readingTime}
                      </p>
                      <p className="text-sm text-slate-400">Min Read</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-4 text-center">
                      <p className="text-3xl font-bold text-yellow-400">
                        {readabilityData.readabilityScore}
                      </p>
                      <p className="text-sm text-slate-400">Readability Score</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-4 text-center">
                      <p
                        className={`text-2xl font-bold ${
                          readabilityData.readabilityLevel === "Easy"
                            ? "text-green-400"
                            : readabilityData.readabilityLevel === "Medium"
                              ? "text-yellow-400"
                              : "text-orange-400"
                        }`}
                      >
                        {readabilityData.readabilityLevel}
                      </p>
                      <p className="text-sm text-slate-400">Level</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-800 border-slate-700 col-span-2">
                    <CardContent className="p-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Sentences:</span>
                        <span className="text-white">
                          {readabilityData.sentenceCount}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm mt-2">
                        <span className="text-slate-400">
                          Avg. Sentence Length:
                        </span>
                        <span className="text-white">
                          {readabilityData.avgSentenceLength} words
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}

          {/* Insights Tab */}
          {activeTab === "insights" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-400">
                  Get AI-powered insights for your content
                </p>
                <Button
                  onClick={getInsights}
                  disabled={isLoading}
                  variant="primary"
                  size="sm"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Lightbulb className="h-4 w-4 mr-2" />
                      Get Insights
                    </>
                  )}
                </Button>
              </div>

              {insights && (
                <div className="space-y-4">
                  {/* Overall Score */}
                  <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-slate-400">
                            Content Quality Score
                          </p>
                          <p className="text-4xl font-bold text-purple-400">
                            {insights.overallScore}/100
                          </p>
                        </div>
                        <Badge
                          className={`${
                            insights.viralPotential === "High"
                              ? "bg-green-500/20 text-green-300"
                              : insights.viralPotential === "Medium"
                                ? "bg-yellow-500/20 text-yellow-300"
                                : "bg-slate-500/20 text-slate-300"
                          }`}
                        >
                          {insights.viralPotential} Viral Potential
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Strengths */}
                  <Card className="bg-slate-800 border-slate-700">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-green-400">
                        ✓ Strengths
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-1">
                        {insights.strengths?.map((s, i) => (
                          <li key={i} className="text-sm text-slate-300">
                            • {s}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Improvements */}
                  <Card className="bg-slate-800 border-slate-700">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-yellow-400">
                        ⚡ Improvements
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-1">
                        {insights.improvements?.map((s, i) => (
                          <li key={i} className="text-sm text-slate-300">
                            • {s}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  {/* SEO Suggestions */}
                  <Card className="bg-slate-800 border-slate-700">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-blue-400">
                        🔍 SEO Tips
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-1">
                        {insights.seoSuggestions?.map((s, i) => (
                          <li key={i} className="text-sm text-slate-300">
                            • {s}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Best Publish Time */}
                  {insights.bestPublishTime && (
                    <Card className="bg-slate-800 border-slate-700">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-400">
                            Best Time to Publish:
                          </span>
                          <Badge className="bg-purple-500/20 text-purple-300">
                            {insights.bestPublishTime}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
