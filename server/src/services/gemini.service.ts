import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

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
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
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

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const jsonText = response.text().replace(/```json|```/g, "").trim();
        return JSON.parse(jsonText);
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
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

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

        const guidelines = platformGuidelines[platform];

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

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const jsonText = response.text().replace(/```json|```/g, "").trim();
        return JSON.parse(jsonText);
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
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
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

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const jsonText = response.text().replace(/```json|```/g, "").trim();
        return JSON.parse(jsonText);
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
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
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

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const jsonText = response.text().replace(/```json|```/g, "").trim();
        return JSON.parse(jsonText);
    } catch (error: any) {
        console.error('Gemini Twitter thread error:', error);
        throw new Error(`Gemini Twitter thread failed: ${error.message}`);
    }
};

export default {
    analyzeContent,
    generateSocialPost,
    generateBlogPost,
    generateTwitterThread
};
