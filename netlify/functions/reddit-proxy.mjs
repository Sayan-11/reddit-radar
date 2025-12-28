export default async (req, context) => {
    try {
        // Parse the incoming request URL
        const url = new URL(req.url);

        // Extract the path after /api/reddit
        // Example: /api/reddit/r/startups/new.json -> /r/startups/new.json
        const path = url.pathname.replace('/api/reddit', '');

        // Construct the target Reddit URL
        const targetUrl = `https://www.reddit.com${path}${url.search}`;

        console.log(`Proxying to: ${targetUrl}`);

        // Fetch from Reddit with a custom User-Agent
        // This is critical to avoid 403 errors from datacenter IPs
        const response = await fetch(targetUrl, {
            headers: {
                'User-Agent': 'RedditRadar/1.0.0 (Netlify Function; +https://reddit-radar.netlify.app)',
                'Accept': 'application/json'
            }
        });

        // Get the response data
        const data = await response.text();

        // Return the response to the client
        return new Response(data, {
            status: response.status,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*', // Enable CORS for the client
                'Cache-Control': 'public, s-maxage=60' // Cache for 60s to be nice to Reddit
            }
        });
    } catch (error) {
        console.error('Proxy error:', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch from Reddit' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
