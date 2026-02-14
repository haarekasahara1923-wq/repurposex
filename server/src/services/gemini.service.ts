import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

// Runtime fallback mechanism
const generateWithFallback = async (prompt: string) => {
    // Priority: 1.5 Flash (Fast/Cheap) -> 1.5 Pro (Powerful) -> 2.0 Flash (Next Gen) -> 1.0 Pro (Legacy)
    const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-2.0-flash-exp", "gemini-1.0-pro"];
    let lastError: any;

    if (!apiKey || apiKey === "YOUR_GEMINI_API_KEY") {
        console.error("Gemini API key is missing or placeholder!");
        throw new Error("Gemini API key is not configured. Please add GEMINI_API_KEY to your .env file.");
    }

    const maskedKey = `${apiKey.substring(0, 5)}...${apiKey.substring(apiKey.length - 4)}`;
    console.log(`Gemini Request (Key: ${maskedKey})`);

    for (const modelName of models) {
        try {
            console.log(`Trying model: ${modelName}`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            if (text) {
                console.log(`Success with model: ${modelName}`);
                return text;
            }
        } catch (error: any) {
            console.error(`Model ${modelName} error:`, error.message);
            lastError = error;

            // If it's a quota (429) or auth (401/403) error, don't bother retrying other models
            if (error.message?.includes('429') || error.message?.includes('403') || error.message?.includes('401')) {
                console.log(`Breaking fallback loop due to terminal error on ${modelName}`);
                break;
            }
            continue; // Try next model on 404, 500 or other errors
        }
    }

    console.error("All Gemini models failed. Last error:", lastError?.message);
    throw lastError || new Error("All Gemini models failed to generate content");
};

// Helper to clean and parse JSON from AI response
const parseAIJson = (text: string) => {
    try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const cleanText = jsonMatch ? jsonMatch[0] : text.replace(/```json|```/g, "").trim();
        return JSON.parse(cleanText);
    } catch (e) {
        console.error("Failed to parse AI JSON:", text);
        throw new Error("Invalid response format from AI");
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
    try {
        const prompt = `Analyze the following content and provide:
1. 3-5 main topics
2. 10-15 relevant keywords
3. Sentiment analysis (positive/negative/neutral with score 0-100)
4. 5 key insights/takeaways
5. Virality potential score (0-100) with reasoning
6. Best platforms for this content (rank: YouTube, Instagram, LinkedIn, TikTok, Twitter)

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
    } catch (error: any) {
        console.error('Gemini Analysis error:', error);
        throw new Error(`Gemini Analysis failed: ${error.message}`);
    }
};

export const generateSocialPost = async (
    sourceText: string,
    platform: 'linkedin' | 'twitter' | 'instagram' | 'facebook',
    tone: 'professional' | 'casual' | 'viral' | 'hinglish' = 'professional'
): Promise<ContentGenerationResult> => {
    try {
        const platformGuidelines = {
            linkedin: {
                maxLength: 2000,
                style: 'Professional, narrative format. Use line breaks. 3-5 hashtags.',
                hooks: 'Start with a hook that grabs attention. Use storytelling.'
            },
            twitter: {
                maxLength: 280,
                style: 'Concise, punchy. 1-2 hashtags max. Clear takeaway.',
                hooks: 'Start with impact. Numbers work well.'
            },
            instagram: {
                maxLength: 2200,
                style: 'Visual-first captions. Emojis welcome. 20-30 hashtags.',
                hooks: 'First line MUST grab attention. Use line breaks.'
            },
            facebook: {
                maxLength: 2000,
                style: 'Conversational, longer form OK. Ask questions.',
                hooks: 'Relatable stories work best.'
            }
        };

        const toneGuidelines = {
            professional: 'Formal, authoritative, corporate tone',
            casual: 'Friendly, conversational, relatable tone',
            viral: 'Engaging, entertaining, shareable with trending elements',
            hinglish: 'Mix of Hindi and English words (e.g., "Bahut important", "Kya soch rahe ho?")'
        };

        const guidelines = platformGuidelines[platform] || platformGuidelines.linkedin;

        const prompt = `Create a ${platform} post from this content.

Platform Guidelines:
- Max length: ${guidelines.maxLength} chars
- Style: ${guidelines.style}
- Hook: ${guidelines.hooks}

Tone: ${toneGuidelines[tone]}

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
    } catch (error: any) {
        console.error('Gemini Social post error:', error);
        throw new Error(`Gemini Social post generation failed: ${error.message}`);
    }
};

export const generateBlogPost = async (
    sourceText: string,
    wordCount: number = 1000
): Promise<ContentGenerationResult> => {
    try {
        const prompt = `Transform the following content into a comprehensive blog post.

Requirements:
- Word count: approximately ${wordCount} words
- SEO-optimized with relevant keywords
- Include an engaging title
- Use headers (H2, H3) for structure
- Include introduction, body sections, and conclusion
- Make it engaging and valuable for readers

Source content:
${sourceText}

Respond STRICTLY in JSON format:
{
  "title": "Engaging Blog Title Here",
  "content": "Full blog post in markdown format...",
  "metaDescription": "SEO meta description (150-160 chars)",
  "keywords": ["keyword1", "keyword2"]
}`;

        const responseText = await generateWithFallback(prompt);
        return parseAIJson(responseText);
    } catch (error: any) {
        console.error('Gemini Blog error:', error);
        throw new Error(`Gemini Blog generation failed: ${error.message}`);
    }
};

export const generateTwitterThread = async (
    sourceText: string,
    threadLength: number = 10
): Promise<ContentGenerationResult> => {
    try {
        const prompt = `Create a ${threadLength}-tweet thread from this content.

Requirements:
- Tweet 1: Hook (make them want to read more)
- Tweets 2-${threadLength - 1}: Value (one insight per tweet, digestible)
- Tweet ${threadLength}: CTA + thread end marker
- Each tweet max 280 characters
- Use numbers (e.g., "1/10", "2/10")
- Make each tweet valuable on its own
- Use line breaks for readability

Source content:
${sourceText}

Respond STRICTLY in JSON format:
{
  "tweets": [
    "Tweet 1/10: Hook here...",
    "Tweet 2/10: First insight...",
    ...
  ],
  "thread_summary": "What this thread is about"
}`;

        const responseText = await generateWithFallback(prompt);
        return parseAIJson(responseText);
    } catch (error: any) {
        console.error('Gemini Twitter thread error:', error);
        throw new Error(`Gemini Twitter thread failed: ${error.message}`);
    }
};

export const generateVideoClips = async (
    sourceText: string,
    numClips: number = 6
): Promise<any> => {
    try {
        const prompt = `Analyze the following video transcript and identify ${numClips} highly engaging, viral-potential short clips.
For each clip, provide:
1. A catchy viral title
2. A very brief description (viral hook)
3. ESTIMATED start and end timestamps (in seconds) based on the content flow.
   - Each clip should be 15-60 seconds long.
   - If the transcript doesn't have timestamps, use logical segments (e.g., Clip 1: 0-30s, Clip 2: 45-90s, etc.).

Transcript:
${sourceText.substring(0, 8000)}

Respond STRICTLY in JSON format:
{
  "clips": [
    {
      "title": "Clip Title",
      "hook": "Viral hook here",
      "startTime": 0,
      "endTime": 30
    }
  ]
}`;

        const responseText = await generateWithFallback(prompt);
        return parseAIJson(responseText);
    } catch (error: any) {
        console.error('Gemini Video Clips error:', error);
        throw new Error(`Gemini Video Clips generation failed: ${error.message}`);
    }
};

export default {
    analyzeContent,
    generateSocialPost,
    generateBlogPost,
    generateTwitterThread,
    generateVideoClips
};
