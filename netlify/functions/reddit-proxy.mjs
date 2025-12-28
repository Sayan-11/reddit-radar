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

        // Fetch from Reddit with headers that mimic a real browser
        // This helps bypass 403 blocks on datacenter IPs
        const response = await fetch(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none',
                'Sec-Fetch-User': '?1',
                'Upgrade-Insecure-Requests': '1'
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
                'Cache-Control': 'public, s-maxage=60' // Cache for 60s
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
