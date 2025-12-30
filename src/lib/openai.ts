/**
 * OpenAI Integration for Reddit Reply Generation
 * Generates authentic, helpful Reddit replies that respect community norms
 */

import OpenAI from "openai";

export interface GenerateReplyInput {
    title: string;
    body: string;
    intent: "help-first" | "soft-credibility" | "conversion-aware";
    persona: "neutral-peer" | "experienced-practitioner" | "curious-collaborator" | "builder-indie-hacker" | "light-authority";
    length: "short" | "medium" | "long";
    instructions?: string;
    styleExamples?: string[];
}

// Initialize OpenAI client
const getOpenAIClient = () => {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

    if (!apiKey) {
        throw new Error(
            "OpenAI API key not found. Please set VITE_OPENAI_API_KEY in your .env file."
        );
    }

    return new OpenAI({
        apiKey,
        dangerouslyAllowBrowser: true, // For client-side usage (consider moving to backend for production)
    });
};

/**
 * Generates a Reddit-appropriate reply using OpenAI
 */
export async function generateReply(input: GenerateReplyInput): Promise<string> {
    const { title, body, intent, persona, length, instructions, styleExamples } = input;

    const openai = getOpenAIClient();

    // Construct system message based on intent and persona
    const systemMessage = buildSystemMessage(intent, persona, length);
    const userMessage = buildUserMessage(title, body, intent, persona, length, instructions, styleExamples);

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o", // Using GPT-4o (latest GPT-4 class model)
            messages: [
                { role: "system", content: systemMessage },
                { role: "user", content: userMessage },
            ],
            temperature: 0.8, // Balanced creativity for natural responses
            max_tokens: 1000, // Increased to accommodate longer replies if requested
        });

        const reply = completion.choices[0]?.message?.content?.trim();

        if (!reply) {
            throw new Error("No reply generated from OpenAI");
        }

        return reply;
    } catch (error) {
        console.error("OpenAI API error:", error);

        if (error instanceof Error) {
            throw new Error(`Failed to generate reply: ${error.message}`);
        }

        throw new Error("Failed to generate reply. Please try again.");
    }
}

/**
 * Builds the system message based on intent, persona, and length
 */
function buildSystemMessage(
    intent: GenerateReplyInput["intent"],
    persona: GenerateReplyInput["persona"],
    length: GenerateReplyInput["length"]
): string {
    const personaGuidance: Record<GenerateReplyInput["persona"], string> = {
        "neutral-peer": `PERSONA: Neutral Peer
- Sound like a regular Redditor sharing personal experience.
- Use casual, everyday language.
- Avoid sounding like an expert or authority.
- This is the safest, most native-sounding option.`,
        "experienced-practitioner": `PERSONA: Experienced Practitioner
- Share advice based on firsthand experience.
- Do NOT sound authoritative or preachy.
- Use "In my experience..." or "I've found that..."
- Focus on practical, real-world insights.`,
        "curious-collaborator": `PERSONA: Curious Collaborator
- Ask thoughtful questions to move the discussion forward.
- Add light guidance based on your own perspective.
- Be supportive and collaborative.
- Focus on exploration rather than definitive answers.`,
        "builder-indie-hacker": `PERSONA: Builder / Indie Hacker
- Frame insights from a builder's perspective.
- Be subtle and transparent about your background.
- Use language like "When I was building X..." or "I'm working on something similar..."
- Focus on the "how" and "why" of building things.`,
        "light-authority": `PERSONA: Light Authority
- Be confident and precise in your insights.
- Do NOT make overt authority claims or list credentials.
- Let the quality of your advice establish your expertise.
- Be direct but stay humble.`,
    };

    const lengthGuidance: Record<GenerateReplyInput["length"], string> = {
        "short": `LENGTH: Short
- Be quick and concise.
- 1-2 short paragraphs maximum.
- Get straight to the point.`,
        "medium": `LENGTH: Medium
- Be balanced and conversational.
- 2-3 paragraphs.
- Provide a good level of detail without being wordy.`,
        "long": `LENGTH: Long
- Be detailed and thorough.
- 3-5 paragraphs.
- Use examples and provide in-depth explanations where appropriate.`,
    };

    const baseRules = `You are a regular member of the subreddit.
You write the way people here usually do.
You avoid sounding instructional, corporate, or promotional.
You do not explain concepts unless asked.
You do not include links.

NEVER:
- Sound like marketing copy or sales pitch
- Use buzzwords or corporate language
- Include ANY links or URLs
- Mention that you're AI-generated
- Be overly promotional or salesy
- Reference the style examples provided (do not quote them or mention analyzing them)

ALWAYS:
- Sound like a real person sharing genuine experience
- Use natural, conversational language
- Be helpful and add real value
- Respect Reddit community norms
- Use line breaks between paragraphs for readability
- If uncertain, be concise and conversational

${personaGuidance[persona]}

${lengthGuidance[length]}`;

    // Intent-specific guidance
    const intentGuidance: Record<GenerateReplyInput["intent"], string> = {
        "help-first": `
HELP-FIRST APPROACH:
- Focus purely on being helpful
- Share genuine advice or perspective
- DO NOT mention any product or tool
- Build goodwill through value
- Be empathetic to their problem`,

        "soft-credibility": `
SOFT CREDIBILITY APPROACH:
- Share your relevant experience naturally
- Mention you've worked on similar problems
- DO NOT claim to have created a product
- Build credibility through expertise
- Hint at knowledge but stay humble`,

        "conversion-aware": `
CONVERSION-AWARE APPROACH (Use carefully):
- You MAY mention you built something relevant
- Keep product mention subtle and brief (1 sentence max)
- Lead with genuine help first
- Frame it as "I built X to solve this exact problem"
- NO links, let them ask for more info if interested
- Still prioritize being helpful over promoting`,
    };

    return `${baseRules}

${intentGuidance[intent]}`;
}

/**
 * Builds the user message with post context
 */
function buildUserMessage(
    title: string,
    body: string,
    intent: GenerateReplyInput["intent"],
    persona: GenerateReplyInput["persona"],
    length: GenerateReplyInput["length"],
    instructions?: string,
    styleExamples?: string[]
): string {
    let message = `Write a helpful Reddit reply to this post.

POST TITLE:
${title}

POST BODY:
${body || "(No body text)"}

`;

    if (instructions) {
        message += `SPECIFIC INSTRUCTIONS (HARD CONSTRAINTS):
${instructions}
(If these instructions conflict with subreddit norms, prioritize safety and subreddit fit, but try to follow them as closely as possible.)

`;
    }

    if (styleExamples && styleExamples.length > 0) {
        message += `Writing style examples from this subreddit (match this style):
${styleExamples.map((ex, i) => `--- Example ${i + 1} ---\n${ex}`).join("\n\n")}

Explicit rules for style:
- Do NOT reference these comments
- Do NOT quote them
- Do NOT mention that you analyzed other comments
- Simply write in a similar voice and tone
`;
    }

    message += `
Remember:
- Sound like a real Reddit user, not an AI or marketer
- Be genuinely helpful
- NO links or URLs
- Adopt the "${persona}" persona consistently
- Match the "${length}" reply length
- Natural, conversational tone
${intent === "conversion-aware" ? "- You may briefly mention (in 1 sentence) that you built something relevant, but prioritize being helpful first" : "- Do NOT mention any products or tools"}

Write the reply now:`;

    return message;
}
/**
 * Suggests relevant subreddits based on a website URL and keywords
 */
export async function suggestSubreddits(url: string, keywords: string[]): Promise<string[]> {
    const openai = getOpenAIClient();

    const systemMessage = `You are a Reddit expert. Your task is to suggest relevant subreddits where people discuss problems, tools, alternatives, and recommendations related to a given website and its keywords.

Constraints:
- Return ONLY subreddit names
- No "r/" prefix
- Lowercase
- Max 5 subreddits
- Min 1 subreddit if confident
- Prefer well-known, active subreddits
- Avoid niche or dead subreddits
- Output as a comma-separated list`;

    const userMessage = `Website URL: ${url}
Keywords: ${keywords.join(", ")}

Suggest relevant subreddits:`;

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: systemMessage },
                { role: "user", content: userMessage },
            ],
            temperature: 0.5,
        });

        const content = completion.choices[0]?.message?.content?.trim();
        if (!content) return [];

        // Parse comma-separated values
        return content.split(",")
            .map(s => s.trim().toLowerCase().replace(/^(\/?r\/)/, ""))
            .filter(s => s.length > 0);
    } catch (error) {
        console.error("OpenAI subreddit suggestion error:", error);
        return [];
    }
}
