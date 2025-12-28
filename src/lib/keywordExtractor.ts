/**
 * Keyword Extraction Utility
 * Extracts meaningful keywords from a website's HTML without using AI.
 */

const STOP_WORDS = new Set([
    "the", "and", "with", "best", "for", "from", "that", "this", "your", "will",
    "have", "more", "about", "their", "there", "what", "which", "when", "where",
    "who", "how", "can", "could", "should", "would", "must", "may", "might",
    "shall", "been", "being", "were", "was", "are", "some", "such", "than",
    "then", "into", "only", "well", "very", "just", "most", "each", "both",
    "once", "here", "there", "than", "them", "they", "ours", "mine", "yours",
    "hers", "his", "its", "each", "many", "much", "some", "any", "none", "all",
    "few", "more", "most", "other", "some", "such", "no", "nor", "not", "only",
    "own", "same", "so", "than", "too", "very", "s", "t", "can", "will", "just",
    "don", "should", "now", "home", "page", "website", "welcome", "click", "here"
]);

/**
 * Fetches HTML from a URL using a CORS proxy
 */
async function fetchHtml(url: string): Promise<string | null> {
    try {
        // Using allorigins.win as a free CORS proxy
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
        const response = await fetch(proxyUrl);
        if (!response.ok) return null;
        const data = await response.json();
        return data.contents;
    } catch (error) {
        console.error("Error fetching website HTML:", error);
        return null;
    }
}

/**
 * Cleans and tokenizes a string into keywords
 */
function tokenize(text: string): string[] {
    if (!text) return [];

    // Replace special characters with spaces, keep alphanumeric and spaces
    const cleanText = text.toLowerCase().replace(/[^a-z0-9\s,]/g, ' ');

    // Split by spaces or commas
    const tokens = cleanText.split(/[\s,]+/).map(t => t.trim()).filter(t => t.length > 2);

    return tokens.filter(token => !STOP_WORDS.has(token));
}

/**
 * Extracts keywords from HTML content
 */
export async function suggestKeywordsFromUrl(url: string): Promise<string[]> {
    const html = await fetchHtml(url);
    if (!html) return [];

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    const keywords: string[] = [];

    // 1. Meta keywords
    const metaKeywords = doc.querySelector('meta[name="keywords"]')?.getAttribute("content");
    if (metaKeywords) {
        keywords.push(...metaKeywords.split(",").map(k => k.trim().toLowerCase()));
    }

    // 2. Meta description
    const metaDesc = doc.querySelector('meta[name="description"]')?.getAttribute("content");
    if (metaDesc) {
        // Extract words from description
        keywords.push(...tokenize(metaDesc));
    }

    // 3. Title
    const title = doc.title;
    if (title) {
        keywords.push(...tokenize(title));
    }

    // 4. H1 and H2
    const headers = Array.from(doc.querySelectorAll("h1, h2"))
        .map(h => h.textContent || "")
        .filter(t => t.length > 0)
        .slice(0, 5); // Limit to first 5 headers

    headers.forEach(header => {
        keywords.push(...tokenize(header));
    });

    // Processing rules:
    // - Remove duplicates
    // - Filter out short words (handled in tokenize)
    // - Limit to 6-10 keywords

    const uniqueKeywords = Array.from(new Set(keywords))
        .filter(k => k.length > 2 && !STOP_WORDS.has(k))
        .slice(0, 10);

    return uniqueKeywords;
}
