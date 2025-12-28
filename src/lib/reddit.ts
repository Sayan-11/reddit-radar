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

        // Construct API URL
        // Construct API URL (using local proxy to avoid CORS)
        const url = `/api/reddit/r/${cleanSubreddit}/new.json?limit=100`;

        // Fetch with User-Agent header (required by Reddit API)
        const response = await fetch(url, {
            headers: {
                "User-Agent": "RedditRadar/1.0.0 (Web App for Reddit Post Monitoring)",
            },
        });

        // Check response status
        if (!response.ok) {
            console.error(`Reddit API error: ${response.status} ${response.statusText}`);
            return [];
        }

        // Parse JSON response
        const data: RedditApiResponse = await response.json();

        // Validate response structure
        if (!data?.data?.children || !Array.isArray(data.data.children)) {
            console.warn("Unexpected Reddit API response structure");
            return [];
        }

        // Calculate time threshold (current time - hours in seconds)
        const currentTime = Math.floor(Date.now() / 1000); // Current time in Unix timestamp
        const timeThreshold = currentTime - hours * 3600; // hours * 3600 seconds

        // Filter and normalize posts
        const posts: RedditPost[] = data.data.children
            .filter((child) => {
                // Filter posts newer than threshold
                return child?.data?.created_utc && child.data.created_utc >= timeThreshold;
            })
            .map((child) => ({
                id: child.data.id || "",
                title: child.data.title || "",
                selftext: child.data.selftext || "",
                subreddit: child.data.subreddit || cleanSubreddit,
                permalink: child.data.permalink || "",
                created_utc: child.data.created_utc || 0,
                num_comments: child.data.num_comments || 0,
                ups: child.data.ups || 0,
            }));

        return posts;
    } catch (error) {
        // Log error for debugging but return empty array
        console.error("Error fetching Reddit posts:", error);
        return [];
    }
}
