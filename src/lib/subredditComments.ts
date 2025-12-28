/**
 * Subreddit Comment Fetcher
 * Fetches high-engagement comments from a subreddit to ground AI replies
 */

interface Comment {
    id: string;
    author: string;
    body: string;
    ups: number;
    permalink: string;
}

/**
 * Fetches top comments from the subreddit within the specified timeframe
 * @param subreddit - The subreddit name
 * @param hours - Timeframe in hours (24 or 168 for 7 days)
 * @returns Array of top 3 comments text, trimmed
 */
export async function fetchSubredditComments(
    subreddit: string,
    hours: number
): Promise<string[]> {
    try {
        const cleanSubreddit = subreddit.replace(/^r\//, "").trim();

        // Determine timeframe for Reddit "top" query
        // 24h -> day, anything else -> week (defaulting to week for > 24h)
        const t = hours <= 24 ? "day" : "week";

        // 1. Fetch top posts from the subreddit
        // Using rss2json to bypass CORS/blocking as per existing patterns
        const postsRssUrl = `https://www.reddit.com/r/${cleanSubreddit}/top.rss?t=${t}&limit=5`;
        const postsApiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(postsRssUrl)}`;

        const postsResponse = await fetch(postsApiUrl);
        if (!postsResponse.ok) return [];

        const postsData = await postsResponse.json();
        if (!postsData || postsData.status !== 'ok' || !Array.isArray(postsData.items)) {
            return [];
        }

        // Extract post IDs from the top 3 posts
        const postIds = postsData.items
            .slice(0, 3)
            .map((item: any) => {
                // Try to extract from link first (most reliable)
                // Link format: https://www.reddit.com/r/SUB/comments/ID/TITLE/
                if (item.link) {
                    const linkMatch = item.link.match(/comments\/([a-z0-9]+)\//);
                    if (linkMatch) return linkMatch[1];
                }

                // Fallback to guid
                // Guid might be a URL or just "t3_ID"
                if (item.guid) {
                    if (item.guid.includes("comments/")) {
                        const guidMatch = item.guid.match(/comments\/([a-z0-9]+)\//);
                        if (guidMatch) return guidMatch[1];
                    }

                    // Handle "t3_ID" format
                    if (item.guid.startsWith("t3_")) {
                        return item.guid.replace("t3_", "");
                    }
                }

                return null;
            })
            .filter((id: string | null) => id !== null) as string[];

        if (postIds.length === 0) return [];

        // 2. Fetch comments for these posts
        // We'll fetch comments for each post in parallel
        const commentsPromises = postIds.map(async (postId) => {
            // Fetch comments RSS for the post, sorted by top
            const commentsRssUrl = `https://www.reddit.com/r/${cleanSubreddit}/comments/${postId}.rss?sort=top&limit=10`;
            const commentsApiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(commentsRssUrl)}`;

            try {
                const res = await fetch(commentsApiUrl);
                if (!res.ok) return [];
                const data = await res.json();
                if (!data || data.status !== 'ok' || !Array.isArray(data.items)) return [];

                return data.items.map((item: any) => {
                    // RSS items for comments usually have description as the body
                    // We need to clean HTML
                    const body = item.content || item.description || "";
                    const cleanBody = body.replace(/<[^>]*>?/gm, '').trim();

                    // Extract author if available (RSS might not have it cleanly, but usually in title or author field)
                    const author = item.author || "";

                    return {
                        id: item.guid,
                        author,
                        body: cleanBody,
                        // RSS doesn't give upvotes, but we sorted by top, so order implies quality.
                        // We'll assign a dummy score based on index to preserve order
                        ups: 0,
                        permalink: item.link
                    };
                });
            } catch (e) {
                console.error(`Error fetching comments for post ${postId}`, e);
                return [];
            }
        });

        const commentsArrays = await Promise.all(commentsPromises);
        const allComments = commentsArrays.flat();

        // 3. Filter and Process Comments
        const validComments = allComments.filter(comment => {
            const body = comment.body;
            const author = comment.author.toLowerCase();

            // Ignore deleted/removed
            if (body === "[deleted]" || body === "[removed]") return false;

            // Ignore bots
            if (author.includes("bot") || author === "automoderator") return false;
            if (body.toLowerCase().includes("i am a bot")) return false;

            // Ignore very short comments
            if (body.length < 20) return false;

            return true;
        });

        // Since we don't have real upvote counts from RSS, we rely on the fact that we fetched "top" comments.
        // The first comments from each post are likely the top ones.
        // We'll take the top 3 unique comments.

        const uniqueComments = new Set<string>();
        const selectedComments: string[] = [];

        for (const comment of validComments) {
            if (selectedComments.length >= 3) break;

            // Trim to ~300 chars
            let text = comment.body;
            if (text.length > 300) {
                text = text.substring(0, 300) + "...";
            }

            if (!uniqueComments.has(text)) {
                uniqueComments.add(text);
                selectedComments.push(text);
            }
        }

        return selectedComments;

    } catch (error) {
        console.error("Error in fetchSubredditComments:", error);
        return [];
    }
}
