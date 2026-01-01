/**
 * Opportunity Scoring Logic
 * Deterministic, explainable scoring for Reddit opportunities
 */

import { RedditPost } from "./reddit";
import { SubredditContext } from "./reddit";

export interface ScoringResult {
    score: number;
    explanation: string[];
}

export function scorePost(
    post: RedditPost,
    keywords: string[] = [],
    subredditContext?: SubredditContext | null
): ScoringResult {
    let score = 0;
    const explanation: string[] = [];

    /* -----------------------------
       1. INTENT SIGNAL (MAX 40)
    ------------------------------*/

    const intentKeywords =
        keywords.length > 0
            ? keywords.map((k) => k.toLowerCase())
            : ["tool", "tools", "alternative", "alternatives", "recommend", "best"];

    const title = post.title.toLowerCase();
    const matched = intentKeywords.filter((k) => title.includes(k));

    if (matched.length > 0) {
        const intentScore = Math.min(40, matched.length * 20);
        score += intentScore;
        explanation.push(
            `High-intent keywords found (${matched.join(", ")}) (+${intentScore})`
        );
    }

    /* -----------------------------
       2. COMPETITION SIGNAL (MAX 20)
    ------------------------------*/

    if (post.num_comments < 3) {
        score += 20;
        explanation.push(`Very low competition (${post.num_comments} comments) (+20)`);
    } else if (post.num_comments < 8) {
        score += 10;
        explanation.push(`Low competition (${post.num_comments} comments) (+10)`);
    }

    /* -----------------------------
       3. FRESHNESS SIGNAL (MAX 25)
    ------------------------------*/

    const now = Math.floor(Date.now() / 1000);
    const ageMinutes = Math.floor((now - post.created_utc) / 60);

    if (ageMinutes < 60) {
        score += 25;
        explanation.push(`Posted within last hour (+25)`);
    } else if (ageMinutes < 180) {
        score += 15;
        explanation.push(`Posted within last 3 hours (+15)`);
    } else {
        explanation.push(`Older post (${Math.floor(ageMinutes / 60)}h ago)`);
    }

    /* -----------------------------
       4. SUBREDDIT VELOCITY (MAX 15)
    ------------------------------*/

    if (subredditContext) {
        const { avgPostsPerHour } = subredditContext;

        if (avgPostsPerHour < 2) {
            score += 15;
            explanation.push(`Slow-moving subreddit (${avgPostsPerHour} posts/hr) (+15)`);
        } else if (avgPostsPerHour < 6) {
            score += 8;
            explanation.push(`Moderate posting velocity (${avgPostsPerHour} posts/hr) (+8)`);
        } else {
            score -= 5;
            explanation.push(`High content churn (${avgPostsPerHour} posts/hr) (-5)`);
        }
    } else {
        explanation.push(`Subreddit velocity data unavailable`);
    }

    /* -----------------------------
       FINAL NORMALIZATION
    ------------------------------*/

    score = Math.max(0, Math.min(100, score));

    if (score === 0) {
        explanation.push("No strong opportunity signals detected");
    }

    return {
        score,
        explanation,
    };
}
