/**
 * OpenAI Integration for Reddit Reply Generation
 * Generates authentic, helpful Reddit replies that respect community norms
 */

import OpenAI from "openai";

export interface GenerateReplyInput {
    title: string;
    body: string;
    intent: "help-first" | "soft-credibility" | "conversion-aware";
    tone: "founder" | "engineer" | "neutral";
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
    const { title, body, intent, tone } = input;

    const openai = getOpenAIClient();

    // Construct system message based on intent and tone
    const systemMessage = buildSystemMessage(intent, tone);
    const userMessage = buildUserMessage(title, body, intent);

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o", // Using GPT-4o (latest GPT-4 class model)
            messages: [
                { role: "system", content: systemMessage },
                { role: "user", content: userMessage },
            ],
            temperature: 0.8, // Balanced creativity for natural responses
            max_tokens: 500, // Keep replies concise
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
 * Builds the system message based on intent and tone
 */
function buildSystemMessage(
    intent: GenerateReplyInput["intent"],
    tone: GenerateReplyInput["tone"]
): string {
    const baseRules = `You are a helpful Reddit user writing a genuine, authentic reply. Follow these critical rules:

NEVER:
- Sound like marketing copy or sales pitch
- Use buzzwords or corporate language
- Include ANY links or URLs
- Mention that you're AI-generated
- Be overly promotional or salesy

ALWAYS:
- Sound like a real person sharing genuine experience
- Be concise and to the point (2-4 paragraphs max)
- Use natural, conversational language
- Be helpful and add real value
- Respect Reddit community norms
- Use line breaks between paragraphs for readability`;

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

    // Tone-specific guidance
    const toneGuidance: Record<GenerateReplyInput["tone"], string> = {
        founder: `
FOUNDER TONE:
- Share entrepreneurial perspective
- Mention "building" or "working on" naturally
- Show hustle and problem-solving mindset
- Use phrases like "I've been working on this" or "while building my project"`,

        engineer: `
ENGINEER TONE:
- Technical but accessible
- Share implementation insights
- Use engineering perspective
- Phrases like "from a technical standpoint" or "I built something to handle this"`,

        neutral: `
NEUTRAL TONE:
- Regular user voice
- No specific persona
- Just a helpful community member
- Avoid mentioning professional role`,
    };

    return `${baseRules}

${intentGuidance[intent]}

${toneGuidance[tone]}`;
}

/**
 * Builds the user message with post context
 */
function buildUserMessage(
    title: string,
    body: string,
    intent: GenerateReplyInput["intent"]
): string {
    return `Write a helpful Reddit reply to this post.

POST TITLE:
${title}

POST BODY:
${body || "(No body text)"}

Remember:
- Sound like a real Reddit user, not an AI or marketer
- Be genuinely helpful and concise
- NO links or URLs
- 2-4 paragraphs maximum
- Natural, conversational tone
${intent === "conversion-aware" ? "- You may briefly mention (in 1 sentence) that you built something relevant, but prioritize being helpful first" : "- Do NOT mention any products or tools"}

Write the reply now:`;
}
