/**
 * Reddit API Integration (RSS-based)
 * Fetches posts + derives subreddit engagement context
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

export interface SubredditContext {
    subreddit: string;
    postsInTimeframe: number;
    avgPostsPerHour: number;
}

export interface RedditFetchResult {
    posts: RedditPost[];
    subredditContext: SubredditContext | null;
}

/**
 * Fetches recent posts from a subreddit and derives subreddit activity metrics
 */
export async function fetchRedditPosts(
    subreddit: string,
    hours: number
): Promise<RedditFetchResult> {
    try {
        if (!subreddit || hours <= 0) {
            return { posts: [], subredditContext: null };
        }

        const cleanSubreddit = subreddit.replace(/^r\//, "").trim();

        const rssUrl = `https://www.reddit.com/r/${cleanSubreddit}/new.rss`;
        const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(
            rssUrl
        )}`;

        const response = await fetch(apiUrl);
        if (!response.ok) {
            return { posts: [], subredditContext: null };
        }

        const data = await response.json();
        if (!data || data.status !== "ok" || !Array.isArray(data.items)) {
            return { posts: [], subredditContext: null };
        }

        const now = Math.floor(Date.now() / 1000);
        const threshold = now - hours * 3600;

        const posts: RedditPost[] = data.items
            .map((item: any) => {
                const created_utc = Math.floor(new Date(item.pubDate).getTime() / 1000);

                const idMatch = item.guid?.match(/comments\/([a-z0-9]+)\//);
                const id = idMatch ? idMatch[1] : crypto.randomUUID();

                let selftext = item.content || "";
                selftext = selftext.replace(/<[^>]*>/g, "");
                selftext = selftext.replace(/submitted by\s+.*$/gi, "");
                selftext = selftext.replace(/\[(link|comments)\]/gi, "");
                selftext = selftext.trim().slice(0, 600);

                return {
                    id,
                    title: item.title || "",
                    selftext,
                    subreddit: cleanSubreddit,
                    permalink: item.link.replace("https://www.reddit.com", ""),
                    created_utc,
                    num_comments: 0,
                    ups: 0,
                };
            })
            .filter((p) => p.created_utc >= threshold);

        const postsInTimeframe = posts.length;
        const avgPostsPerHour =
            hours > 0 ? Number((postsInTimeframe / hours).toFixed(2)) : 0;

        return {
            posts,
            subredditContext: {
                subreddit: cleanSubreddit,
                postsInTimeframe,
                avgPostsPerHour,
            },
        };
    } catch (err) {
        console.error("Reddit fetch failed:", err);
        return { posts: [], subredditContext: null };
    }
}
