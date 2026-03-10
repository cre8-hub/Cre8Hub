import OpenAI from "openai";
import { pool } from "../../config/db";

/** Returns an OpenAI client. Called lazily so missing key doesn't crash startup. */
function getOpenAIClient(): OpenAI {
    return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

/** Monthly free-tier quota. Override via env. */
const FREE_MONTHLY_QUOTA = Number(process.env.AI_FREE_MONTHLY_QUOTA ?? 5);

// ─── Product type definitions ────────────────────────────────────────────────

export type AiProductType =
    | "EBOOK"
    | "PROMPT_PACK"
    | "SOCIAL_MEDIA_TEMPLATE_PACK"
    | "COURSE_OUTLINE"
    | "NOTION_TEMPLATE";

export interface GeneratedProduct {
    title: string;
    description: string;
    content: string;
    suggestedPrice: number;
}

// ─── Prompt templates ────────────────────────────────────────────────────────

function buildPrompt(topic: string, productType: AiProductType): string {
    const base = `You are an expert digital product creator for the Cre8hub marketplace.
Return ONLY valid JSON with keys: title, description, content, suggestedPrice (number in USD).
Keep descriptions under 200 words. Make content comprehensive and structured.`;

    const templates: Record<AiProductType, string> = {
        EBOOK: `${base}
Create a complete Ebook outline + first-chapter draft about: "${topic}".
- title: compelling Ebook title
- description: sales-page description (150 words)
- content: full ebook content with chapters, sections, and bullet points (aim for ~1500 words)
- suggestedPrice: between 9 and 49`,

        PROMPT_PACK: `${base}
Create a premium AI Prompt Pack about: "${topic}".
- title: catchy prompt pack name
- description: what prompts are included and their value (150 words)
- content: 15 detailed, ready-to-use prompts with context and example outputs
- suggestedPrice: between 7 and 29`,

        SOCIAL_MEDIA_TEMPLATE_PACK: `${base}
Create a Social Media Template Pack about: "${topic}".
- title: name of the template pack
- description: what templates are included and target audience (150 words)
- content: 10 ready-to-post social media captions or post frameworks with hashtag suggestions for Instagram, Twitter, and LinkedIn
- suggestedPrice: between 9 and 39`,

        COURSE_OUTLINE: `${base}
Create a comprehensive online Course Outline about: "${topic}".
- title: professional course name
- description: what students will learn, prerequisites, outcome (150 words)
- content: full course outline with 5-8 modules, each having 3-5 lesson titles and key learning objectives
- suggestedPrice: between 29 and 197`,

        NOTION_TEMPLATE: `${base}
Create a Notion Template description and structure for: "${topic}".
- title: Notion template name
- description: use-cases and who it's for (150 words)
- content: everything the buyer gets — database schemas, page structures, properties, views, and usage instructions
- suggestedPrice: between 7 and 29`,
    };

    return templates[productType];
}

// ─── Quota check ─────────────────────────────────────────────────────────────

async function checkQuota(userId: string): Promise<void> {
    // Attempt to read user plan; default to "free" if column doesn't exist
    let plan = "free";
    try {
        const userResult = await pool.query(
            "SELECT plan FROM users WHERE id = $1",
            [userId]
        );
        plan = userResult.rows[0]?.plan ?? "free";
    } catch {
        // users.plan column may not exist – treat as free
    }

    if (plan === "pro") return; // unlimited for pro

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const countResult = await pool.query(
        `SELECT COUNT(*) FROM ai_generations
     WHERE user_id = $1 AND created_at >= $2`,
        [userId, startOfMonth]
    );

    const count = Number(countResult.rows[0].count);
    if (count >= FREE_MONTHLY_QUOTA) {
        const err: any = new Error(
            `Monthly generation limit reached (${FREE_MONTHLY_QUOTA}/month on free plan). Upgrade to Pro for unlimited.`
        );
        err.status = 429;
        throw err;
    }
}

// ─── Log generation ──────────────────────────────────────────────────────────

async function logGeneration(
    userId: string,
    topic: string,
    productType: string,
    tokensUsed: number
): Promise<void> {
    await pool.query(
        `INSERT INTO ai_generations (user_id, topic, product_type, tokens_used)
     VALUES ($1, $2, $3, $4)`,
        [userId, topic, productType, tokensUsed]
    );
}

// ─── Main service function ────────────────────────────────────────────────────

export async function generateProductContent(
    userId: string,
    topic: string,
    productType: AiProductType
): Promise<GeneratedProduct> {
    await checkQuota(userId);

    const prompt = buildPrompt(topic, productType);

    const response = await getOpenAIClient().chat.completions.create({
        model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [{ role: "user", content: prompt }],
        temperature: 0.8,
        max_tokens: 2500,
    });

    const tokensUsed = response.usage?.total_tokens ?? 0;
    const raw = response.choices[0]?.message?.content ?? "{}";

    let parsed: Partial<GeneratedProduct>;
    try {
        parsed = JSON.parse(raw);
    } catch {
        const parseErr: any = new Error("AI returned invalid JSON. Please try again.");
        parseErr.status = 502;
        throw parseErr;
    }

    // Validate required fields
    if (!parsed.title || !parsed.description || !parsed.content) {
        const fieldErr: any = new Error("AI response was incomplete. Please try again.");
        fieldErr.status = 502;
        throw fieldErr;
    }

    // Log asynchronously – don't block the response
    logGeneration(userId, topic, productType, tokensUsed).catch(console.error);

    return {
        title: String(parsed.title),
        description: String(parsed.description),
        content: String(parsed.content),
        suggestedPrice: Number(parsed.suggestedPrice) || 19,
    };
}
