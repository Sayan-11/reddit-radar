/**
 * Opportunity Scoring Logic
 * Scores Reddit posts based on explicit, deterministic rules
 */

import { RedditPost } from "./reddit";

export interface ScoringResult {
    score: number;
    explanation: string[];
}

/**
 * Scores a Reddit post based on predefined rules
 * @param post - The Reddit post to score
 * @returns Scoring result with score and explanation
 */
export function scorePost(post: RedditPost, keywords: string[] = []): ScoringResult {
    let score = 0;
    const explanation: string[] = [];

    // Rule 1: Check title for high-intent keywords (+30 points)
    // Use provided keywords if available, otherwise fallback to defaults
    const highIntentKeywords = keywords.length > 0
        ? keywords.map(k => k.toLowerCase().trim())
        : ["tool", "tools", "alternative", "alternatives", "recommend"];

    const titleLower = post.title.toLowerCase();

    const matchedKeywords = highIntentKeywords.filter((keyword) =>
        titleLower.includes(keyword)
    );

    if (matchedKeywords.length > 0) {
        score += 30;
        explanation.push(
            `High-intent keywords found: ${matchedKeywords.join(", ")} (+30)`
        );
    }

    // Rule 2: Low comment count indicates early opportunity (+20 points)
    if (post.num_comments < 15) {
        score += 20;
        explanation.push(`Low comment count (${post.num_comments} comments) (+20)`);
    }

    // Rule 3: Recent post (< 3 hours old) indicates fresh opportunity (+25 points)
    const currentTime = Math.floor(Date.now() / 1000); // Current Unix timestamp in seconds
    const postAgeInSeconds = currentTime - post.created_utc;
    const postAgeInHours = postAgeInSeconds / 3600;

    if (postAgeInHours < 3) {
        score += 25;
        const minutesAgo = Math.floor(postAgeInSeconds / 60);
        explanation.push(
            `Recent post (${minutesAgo} minutes old) (+25)`
        );
    }

    // Cap score at 100
    if (score > 100) {
        score = 100;
        explanation.push("Score capped at 100");
    }

    // Add summary if no points were earned
    if (score === 0) {
        explanation.push("No scoring criteria met");
    }

    return {
        score,
        explanation,
    };
}
