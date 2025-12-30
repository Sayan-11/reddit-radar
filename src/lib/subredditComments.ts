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

        // Fetch the latest comments from the entire subreddit
        // This is more reliable than fetching top posts and then their comments
        const rssUrl = `https://www.reddit.com/r/${cleanSubreddit}/comments.rss?limit=50`;
        const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;

        const response = await fetch(apiUrl);
        if (!response.ok) {
            console.error(`Subreddit comments RSS error: ${response.status}`);
            return [];
        }

        const data = await response.json();
        if (!data || data.status !== 'ok' || !Array.isArray(data.items)) {
            return [];
        }

        // Process and filter comments
        const validComments = data.items
            .map((item: any) => {
                // RSS items for comments usually have the body in 'content' or 'description'
                const body = item.content || item.description || "";
                const cleanBody = body.replace(/<[^>]*>?/gm, '').trim();

                // Extract author from the title or author field
                // Reddit RSS titles for comments are often "Comment by u/username on..."
                let author = item.author || "";
                if (!author && item.title && item.title.startsWith("Comment by ")) {
                    const match = item.title.match(/Comment by u\/([^\s]+)/);
                    if (match) author = match[1];
                }

                return {
                    body: cleanBody,
                    author: author.toLowerCase()
                };
            })
            .filter(comment => {
                const { body, author } = comment;

                // Ignore deleted/removed
                if (body === "[deleted]" || body === "[removed]") return false;

                // Ignore bots
                if (author.includes("bot") || author === "automoderator") return false;
                if (body.toLowerCase().includes("i am a bot")) return false;

                // Ignore very short comments
                if (body.length < 20) return false;

                // Ignore the "submitted by..." footer if it leaked in
                if (body.includes("submitted by") && body.includes("[link]")) return false;

                return true;
            });

        // Take top 3 unique comments
        const uniqueComments = new Set<string>();
        const selectedComments: string[] = [];

        for (const comment of validComments) {
            if (selectedComments.length >= 3) break;

            // Trim to ~300 chars for the prompt
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
