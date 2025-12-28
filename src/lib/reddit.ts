/**
 * Reddit API Integration
 * Fetches posts from Reddit's public JSON endpoints
 */

export interface RedditPost {
    id: string;
    title: string;
    selftext: string;
    subreddit: string;
    permalink: string;
    created_utc: number;
    num_comments: number;
    ups: number;
}

interface RedditApiPost {
    data: {
        id: string;
        title: string;
        selftext: string;
        subreddit: string;
        permalink: string;
        created_utc: number;
        num_comments: number;
        ups: number;
    };
}

interface RedditApiResponse {
    data: {
        children: RedditApiPost[];
    };
}

/**
 * Fetches recent posts from a given subreddit
 * @param subreddit - The subreddit name (without r/ prefix)
 * @param hours - Number of hours to look back for posts
 * @returns Array of normalized Reddit posts
 */
export async function fetchRedditPosts(
    subreddit: string,
    hours: number
): Promise<RedditPost[]> {
    try {
        // Validate inputs
        if (!subreddit || subreddit.trim() === "") {
            console.warn("Invalid subreddit provided");
            return [];
        }

        if (hours <= 0) {
            console.warn("Invalid hours value, must be positive");
            return [];
        }

        // Clean subreddit name (remove r/ prefix if present)
        const cleanSubreddit = subreddit.replace(/^r\//, "").trim();

        // Construct RSS URL and then the rss2json URL
        // We use rss2json to bypass CORS and Reddit's strict IP blocking on serverless functions
        const rssUrl = `https://www.reddit.com/r/${cleanSubreddit}/new.rss`;
        const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;

        const response = await fetch(apiUrl);

        // Check response status
        if (!response.ok) {
            console.error(`RSS API error: ${response.status} ${response.statusText}`);
            return [];
        }

        // Parse JSON response
        const data = await response.json();

        // Validate response structure
        if (!data || data.status !== 'ok' || !Array.isArray(data.items)) {
            console.warn("Unexpected RSS API response structure", data);
            return [];
        }

        // Calculate time threshold (current time - hours in seconds)
        const currentTime = Math.floor(Date.now() / 1000); // Current time in Unix timestamp
        const timeThreshold = currentTime - hours * 3600; // hours * 3600 seconds

        // Filter and normalize posts
        const posts: RedditPost[] = data.items
            .map((item: any) => {
                // Parse pubDate to timestamp
                const created_utc = Math.floor(new Date(item.pubDate).getTime() / 1000);

                // Extract ID from guid (usually looks like https://www.reddit.com/r/.../comments/ID/...)
                const idMatch = item.guid.match(/comments\/([a-z0-9]+)\//);
                const id = idMatch ? idMatch[1] : Math.random().toString(36).substr(2, 9);

                // Clean up content (RSS often has HTML)
                // We strip HTML tags for the 'selftext' preview
                const selftext = item.content.replace(/<[^>]*>?/gm, '').substring(0, 500);

                // Extract permalink from link
                const permalink = item.link.replace('https://www.reddit.com', '');

                return {
                    id,
                    title: item.title || "",
                    selftext,
                    subreddit: cleanSubreddit,
                    permalink,
                    created_utc,
                    // RSS feeds don't provide these metrics, so we default to 0
                    // This ensures the app doesn't crash, though scoring will be based mostly on keywords/recency
                    num_comments: 0,
                    ups: 0,
                };
            })
            .filter((post: RedditPost) => {
                // Filter posts newer than threshold
                return post.created_utc >= timeThreshold;
            });

        return posts;
    } catch (error) {
        // Log error for debugging but return empty array
        console.error("Error fetching Reddit posts:", error);
        return [];
    }
}
