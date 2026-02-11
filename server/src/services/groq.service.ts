import Groq from "groq-sdk";

const apiKey = process.env.GROQ_API_KEY || "";
const groq = new Groq({
    apiKey: apiKey,
});

// Runtime fallback mechanism for Groq models
const generateWithFallback = async (prompt: string) => {
    // Priority: Llama-3.3-70b (Top) -> Llama-3.1-70b -> Llama-3.1-8b (Fast)
    const models = ["llama-3.3-70b-versatile", "llama-3.1-70b-versatile", "llama-3.1-8b-instant", "llama3-70b-8192", "llama3-8b-8192"];
    let lastError: any;

    if (!apiKey) {
        console.error("Groq API key is missing!");
        throw new Error("Groq API key is not configured. Please add GROQ_API_KEY to your .env file.");
    }

    console.log(`Groq Request Initiated`);

    for (const modelName of models) {
        try {
            console.log(`Trying Groq model: ${modelName}`);
            const completion = await groq.chat.completions.create({
                messages: [{ role: "user", content: prompt }],
                model: modelName,
                temperature: 0.7,
                response_format: { type: "json_object" }
            });

            const text = completion.choices[0]?.message?.content;

            if (text) {
                console.log(`Success with Groq model: ${modelName}`);
                return text;
            }
        } catch (error: any) {
            console.error(`Groq Model ${modelName} error:`, error.message);
            lastError = error;

            // If it's a quota (429) or auth (401/403), stop retrying
            if (error.message?.includes('429') || error.message?.includes('403') || error.message?.includes('401')) {
                break;
            }
            continue;
        }
    }

    throw lastError || new Error("All Groq models failed");
};

// Helper to clean and parse JSON from AI response
const parseAIJson = (text: string) => {
    try {
        return JSON.parse(text);
    } catch (e) {
        console.error("Failed to parse Groq AI JSON:", text);
        throw new Error("Invalid response format from Groq AI");
    }
};

export interface ContentGenerationResult {
    content: string;
    title?: string;
    metadata?: any;
    keywords?: string[];
    metaDescription?: string;
    hashtags?: string[];
    cta?: string;
    tweets?: string[];
    caption?: string;
}

export const analyzeContent = async (text: string): Promise<any> => {
    const prompt = `Analyze the following content and provide:
1. 3-5 main topics
2. 10-15 relevant keywords
3. Sentiment analysis (positive/negative/neutral with score 0-100)
4. 5 key insights/takeaways
5. Virality potential score (0-100) with reasoning
6. Best platforms for this content

Content:
${text}

Respond STRICTLY in JSON format:
{
  "topics": ["topic1", "topic2"],
  "keywords": ["keyword1", "keyword2"],
  "sentiment": { "type": "positive", "score": 85 },
  "keyInsights": ["insight1", "insight2"],
  "viralityScore": 75,
  "viralityReasoning": "...",
  "platformScores": {
    "youtube": 90,
    "instagram": 75,
    "linkedin": 85,
    "tiktok": 60,
    "twitter": 70
  }
}`;

    const responseText = await generateWithFallback(prompt);
    return parseAIJson(responseText);
};

export const generateSocialPost = async (
    sourceText: string,
    platform: 'linkedin' | 'twitter' | 'instagram' | 'facebook',
    tone: 'professional' | 'casual' | 'viral' | 'hinglish' = 'professional'
): Promise<ContentGenerationResult> => {
    const prompt = `Create a ${platform} post from this content in ${tone} tone.
Source content:
${sourceText.substring(0, 5000)}

Respond STRICTLY in JSON format:
{
  "content": "The actual post content...",
  "hashtags": ["#hashtag1", "#hashtag2"],
  "cta": "Optional call-to-action",
  "caption": "Instagram caption if applicable"
}`;

    const responseText = await generateWithFallback(prompt);
    return parseAIJson(responseText);
};

export const generateBlogPost = async (
    sourceText: string,
    wordCount: number = 1000
): Promise<ContentGenerationResult> => {
    const prompt = `Transform into a ${wordCount} word blog post.
Source content:
${sourceText}

Respond STRICTLY in JSON format:
{
  "title": "Engaging Blog Title",
  "content": "Full blog post in markdown...",
  "metaDescription": "SEO meta description",
  "keywords": ["keyword1", "keyword2"]
}`;

    const responseText = await generateWithFallback(prompt);
    return parseAIJson(responseText);
};

export const generateTwitterThread = async (
    sourceText: string,
    threadLength: number = 10
): Promise<ContentGenerationResult> => {
    const prompt = `Create a ${threadLength}-tweet thread.
Source content:
${sourceText}

Respond STRICTLY in JSON format:
{
  "tweets": ["Tweet 1", "Tweet 2", ...],
  "thread_summary": "Summary"
}`;

    const responseText = await generateWithFallback(prompt);
    return parseAIJson(responseText);
};

export default {
    analyzeContent,
    generateSocialPost,
    generateBlogPost,
    generateTwitterThread
};
