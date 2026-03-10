import { Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware";
import { generateProductContent, AiProductType } from "./ai.service";

const VALID_PRODUCT_TYPES: AiProductType[] = [
    "EBOOK",
    "PROMPT_PACK",
    "SOCIAL_MEDIA_TEMPLATE_PACK",
    "COURSE_OUTLINE",
    "NOTION_TEMPLATE",
];

export const generateProductHandler = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const { topic, productType } = req.body;

        if (!topic || typeof topic !== "string" || topic.trim().length < 3) {
            res.status(400).json({ message: "topic must be at least 3 characters." });
            return;
        }

        if (!productType || !VALID_PRODUCT_TYPES.includes(productType)) {
            res.status(400).json({
                message: `productType must be one of: ${VALID_PRODUCT_TYPES.join(", ")}`,
            });
            return;
        }

        if (!process.env.OPENAI_API_KEY) {
            res.status(503).json({
                message:
                    "AI feature is not configured. Please add OPENAI_API_KEY to the server environment.",
            });
            return;
        }

        const result = await generateProductContent(
            req.user.id,
            topic.trim(),
            productType as AiProductType
        );

        res.json(result);
    } catch (err: any) {
        res.status(err.status || 500).json({ message: err.message });
    }
};
