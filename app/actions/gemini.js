"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function generateBlogContent(title, category = "", tags = []) {
  try {
    if (!title || title.trim().length === 0) {
      throw new Error("Title is required to generate content");
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Create a detailed prompt for blog content generation
    const prompt = `
Write a comprehensive blog post with the title: "${title}"

${category ? `Category: ${category}` : ""}
${tags.length > 0 ? `Tags: ${tags.join(", ")}` : ""}

Requirements:
- Write engaging, informative content that matches the title
- Use proper HTML formatting with headers (h2, h3), paragraphs, lists, and emphasis
- Include 3-5 main sections with clear subheadings
- Write in a conversational yet professional tone
- Make it approximately 800-1200 words
- Include practical insights, examples, or actionable advice where relevant
- Use <h2> for main sections and <h3> for subsections
- Use <p> tags for paragraphs
- Use <ul> and <li> for bullet points when appropriate
- Use <strong> and <em> for emphasis
- Ensure the content is original and valuable to readers

Do not include the title in the content as it will be added separately.
Start directly with the introduction paragraph.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text();

    // Basic validation
    if (!content || content.trim().length < 100) {
      throw new Error("Generated content is too short or empty");
    }

    return {
      success: true,
      content: content.trim(),
    };
  } catch (error) {
    console.error("Gemini AI Error:", error);

    // Handle specific error types
    if (error.message?.includes("API key")) {
      return {
        success: false,
        error: "AI service configuration error. Please try again later.",
      };
    }

    if (error.message?.includes("quota") || error.message?.includes("limit")) {
      return {
        success: false,
        error: "AI service is temporarily unavailable. Please try again later.",
      };
    }

    return {
      success: false,
      error: error.message || "Failed to generate content. Please try again.",
    };
  }
}

export async function improveContent(
  currentContent,
  improvementType = "enhance"
) {
  try {
    if (!currentContent || currentContent.trim().length === 0) {
      throw new Error("Content is required for improvement");
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    let prompt = "";

    switch (improvementType) {
      case "expand":
        prompt = `
Take this blog content and expand it with more details, examples, and insights:

${currentContent}

Requirements:
- Keep the existing structure and main points
- Add more depth and detail to each section
- Include practical examples and insights
- Maintain the original tone and style
- Return the improved content in the same HTML format
`;
        break;

      case "simplify":
        prompt = `
Take this blog content and make it more concise and easier to read:

${currentContent}

Requirements:
- Keep all main points but make them clearer
- Remove unnecessary complexity
- Use simpler language where possible
- Maintain the HTML formatting
- Keep the essential information
`;
        break;

      default: // enhance
        prompt = `
Improve this blog content by making it more engaging and well-structured:

${currentContent}

Requirements:
- Improve the flow and readability
- Add engaging transitions between sections
- Enhance with better examples or explanations
- Maintain the original HTML structure
- Keep the same length approximately
- Make it more compelling to read
`;
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const improvedContent = response.text();

    return {
      success: true,
      content: improvedContent.trim(),
    };
  } catch (error) {
    console.error("Content improvement error:", error);
    return {
      success: false,
      error: error.message || "Failed to improve content. Please try again.",
    };
  }
}

// ============================================
// NEW AI FEATURES FOR RESUME STANDOUT
// ============================================

/**
 * AI SEO Optimizer - Generate meta description, keywords, and social preview
 */
export async function generateSeoMetadata(title, content) {
  try {
    if (!title || !content) {
      throw new Error("Title and content are required for SEO optimization");
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
Analyze this blog post and generate SEO metadata:

Title: "${title}"
Content: ${content.substring(0, 3000)}

Generate the following in JSON format (return ONLY valid JSON, no markdown):
{
  "metaDescription": "A compelling 150-160 character meta description for search engines",
  "keywords": ["array", "of", "5-8", "relevant", "seo", "keywords"],
  "socialPreviewText": "An engaging 200-250 character preview for social media sharing",
  "suggestedSlug": "url-friendly-slug-for-the-post"
}

Requirements:
- Meta description should be compelling and include primary keyword
- Keywords should be relevant and searchable terms
- Social preview should be engaging and shareable
- All text should be natural and not keyword-stuffed
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse JSON from response (handle potential markdown code blocks)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to parse SEO metadata");
    }
    
    const seoData = JSON.parse(jsonMatch[0]);

    return {
      success: true,
      data: seoData,
    };
  } catch (error) {
    console.error("SEO generation error:", error);
    return {
      success: false,
      error: error.message || "Failed to generate SEO metadata.",
    };
  }
}

/**
 * AI Title Generator - Generate multiple catchy title variations
 */
export async function generateTitleVariations(currentTitle, content = "") {
  try {
    if (!currentTitle) {
      throw new Error("Current title is required");
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
Generate 5 alternative catchy titles for this blog post:

Current Title: "${currentTitle}"
${content ? `Content Preview: ${content.substring(0, 1000)}` : ""}

Requirements:
- Each title should be unique and engaging
- Mix different styles: question-based, how-to, numbered lists, intriguing statements
- Keep titles under 60 characters for SEO
- Make them click-worthy but not clickbait
- Return ONLY a JSON array of strings, no markdown

Example format: ["Title 1", "Title 2", "Title 3", "Title 4", "Title 5"]
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse JSON array from response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("Failed to parse title variations");
    }
    
    const titles = JSON.parse(jsonMatch[0]);

    return {
      success: true,
      titles: titles,
    };
  } catch (error) {
    console.error("Title generation error:", error);
    return {
      success: false,
      error: error.message || "Failed to generate titles.",
    };
  }
}

/**
 * Calculate reading time and readability score
 */
export async function analyzeContentReadability(content) {
  try {
    if (!content) {
      throw new Error("Content is required for analysis");
    }

    // Strip HTML tags for text analysis
    const textContent = content.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    const words = textContent.split(/\s+/).filter(word => word.length > 0);
    const wordCount = words.length;
    const sentences = textContent.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const sentenceCount = sentences.length || 1;
    
    // Calculate reading time (average 200 words per minute)
    const readingTime = Math.ceil(wordCount / 200);
    
    // Calculate average sentence length
    const avgSentenceLength = wordCount / sentenceCount;
    
    // Calculate average word length
    const avgWordLength = words.join("").length / wordCount;
    
    // Simple Flesch-Kincaid-like readability score
    // Higher score = easier to read (0-100 scale)
    let readabilityScore = 100 - (avgSentenceLength * 1.5) - (avgWordLength * 10);
    readabilityScore = Math.max(0, Math.min(100, Math.round(readabilityScore)));
    
    // Determine readability level
    let readabilityLevel;
    if (readabilityScore >= 70) {
      readabilityLevel = "Easy";
    } else if (readabilityScore >= 50) {
      readabilityLevel = "Medium";
    } else {
      readabilityLevel = "Advanced";
    }

    return {
      success: true,
      data: {
        wordCount,
        readingTime,
        readabilityScore,
        readabilityLevel,
        avgSentenceLength: Math.round(avgSentenceLength * 10) / 10,
        sentenceCount,
      },
    };
  } catch (error) {
    console.error("Readability analysis error:", error);
    return {
      success: false,
      error: error.message || "Failed to analyze content.",
    };
  }
}

/**
 * Extract Table of Contents from HTML content
 */
export async function extractTableOfContents(htmlContent) {
  try {
    if (!htmlContent) {
      return { success: true, toc: [] };
    }

    const headingRegex = /<h([1-3])[^>]*>(.*?)<\/h[1-3]>/gi;
    const toc = [];
    let match;
    let index = 0;

    while ((match = headingRegex.exec(htmlContent)) !== null) {
      const level = parseInt(match[1]);
      const text = match[2].replace(/<[^>]*>/g, "").trim(); // Strip inner HTML tags
      
      if (text) {
        toc.push({
          id: `heading-${index}`,
          text: text,
          level: level,
        });
        index++;
      }
    }

    return {
      success: true,
      toc: toc,
    };
  } catch (error) {
    console.error("TOC extraction error:", error);
    return {
      success: false,
      error: error.message || "Failed to extract table of contents.",
    };
  }
}

/**
 * AI Content Performance Insights - Analyze why content might perform well/poorly
 */
export async function generateContentInsights(title, content, metrics = {}) {
  try {
    if (!title || !content) {
      throw new Error("Title and content are required for insights");
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
Analyze this blog post and provide performance insights:

Title: "${title}"
Content: ${content.substring(0, 2000)}
${metrics.views ? `Current Views: ${metrics.views}` : ""}
${metrics.likes ? `Current Likes: ${metrics.likes}` : ""}

Provide actionable insights in JSON format (return ONLY valid JSON, no markdown):
{
  "overallScore": 85,
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "improvements": ["improvement suggestion 1", "improvement suggestion 2"],
  "engagementTips": ["tip 1", "tip 2"],
  "seoSuggestions": ["seo tip 1", "seo tip 2"],
  "viralPotential": "Medium",
  "bestPublishTime": "Tuesday 10 AM EST"
}

Requirements:
- overallScore should be 0-100 based on content quality
- Provide 2-4 items for each array
- Be specific and actionable
- viralPotential should be "Low", "Medium", or "High"
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to parse insights");
    }
    
    const insights = JSON.parse(jsonMatch[0]);

    return {
      success: true,
      insights: insights,
    };
  } catch (error) {
    console.error("Content insights error:", error);
    return {
      success: false,
      error: error.message || "Failed to generate insights.",
    };
  }
}
