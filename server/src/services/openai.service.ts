import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

if (!process.env.OPENAI_API_KEY) {
    console.error('CRITICAL: OPENAI_API_KEY is not defined in environment variables!');
}

export interface TranscriptionResult {
    text: string;
    language?: string;
    duration?: number;
}

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

// ========================================
// TRANSCRIPTION SERVICES
// ========================================

export const transcribeAudio = async (
    audioFilePath: string
): Promise<TranscriptionResult> => {
    try {
        const transcription = await openai.audio.transcriptions.create({
            file: await fetch(audioFilePath).then(r => r.blob()) as any,
            model: 'whisper-1',
            language: 'en', // Auto-detect or specify
            response_format: 'verbose_json'
        });

        return {
            text: transcription.text,
            language: (transcription as any).language,
            duration: (transcription as any).duration
        };
    } catch (error: any) {
        console.error('Transcription error:', error);
        throw new Error(`Transcription failed: ${error.message || error}`);
    }
};

// ========================================
// CONTENT ANALYSIS
// ========================================

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

Respond in JSON format:
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

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: 'You are an expert content analyst specializing in social media and content strategy.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.3
        });

        const analysis = JSON.parse(response.choices[0].message.content || '{}');
        return analysis;
    } catch (error: any) {
        console.error('Content analysis error:', error);
        throw new Error(`Analysis failed: ${error.message || error}`);
    }
};

// ========================================
// CONTENT GENERATION
// ========================================

export const generateBlogPost = async (
    sourceText: string,
    wordCount: number = 1500
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

Respond in JSON format:
{
  "title": "Engaging Blog Title Here",
  "content": "Full blog post in markdown format...",
  "metaDescription": "SEO meta description (150-160 chars)",
  "keywords": ["keyword1", "keyword2"]
}`;

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: 'You are an expert content writer and SEO specialist.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.7,
            max_tokens: 4000
        });

        const result = JSON.parse(response.choices[0].message.content || '{}');
        return result;
    } catch (error: any) {
        console.error('Blog generation error:', error);
        throw new Error(`Blog generation failed: ${error.message || error}`);
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

        const guidelines = platformGuidelines[platform];

        const prompt = `Create a ${platform} post from this content.

Platform Guidelines:
- Max length: ${guidelines.maxLength} chars
- Style: ${guidelines.style}
- Hook: ${guidelines.hooks}

Tone: ${toneGuidelines[tone]}

Source content:
${sourceText.substring(0, 2000)}

Respond in JSON format:
{
  "content": "The actual post content...",
  "hashtags": ["#hashtag1", "#hashtag2"],
  "cta": "Optional call-to-action",
  "caption": "Instagram caption if applicable"
}`;

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: `You are an expert social media content creator specializing in ${platform}.`
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.8,
            max_tokens: 1000
        });

        const result = JSON.parse(response.choices[0].message.content || '{}');
        return result;
    } catch (error: any) {
        console.error('Social post generation error:', error);
        throw new Error(`Social post generation failed: ${error.message || error}`);
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

Respond in JSON format:
{
  "tweets": [
    "Tweet 1/10: Hook here...",
    "Tweet 2/10: First insight...",
    ...
  ],
  "thread_summary": "What this thread is about"
}`;

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: 'You are an expert Twitter content creator known for viral threads.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.8,
            max_tokens: 2000
        });

        const result = JSON.parse(response.choices[0].message.content || '{}');
        return result;
    } catch (error: any) {
        console.error('Twitter thread generation error:', error);
        throw new Error(`Twitter thread generation failed: ${error.message || error}`);
    }
};

// ========================================
// VIDEO CONTENT ANALYSIS
// ========================================

export const extractVideoHooks = async (
    transcript: string,
    videoDuration: number
): Promise<any> => {
    try {
        const prompt = `Analyze this video transcript and identify the best moments for short-form clips (30-90 seconds).

Video Duration: ${Math.floor(videoDuration / 60)} minutes

Transcript:
${transcript}

For each hook moment, provide:
1. Timestamp (approximate - format: MM:SS)
2. Hook text (the actual quote)
3. Virality score (0-100)
4. Why it's engaging
5. Suggested short video title
6. Best platform (Instagram Reels / TikTok / YouTube Shorts)

Identify the TOP 8 hook moments.

Respond in JSON format:
{
  "hooks": [
    {
      "timestamp": "02:15",
      "timestampSeconds": 135,
      "hookText": "The actual quote...",
      "viralityScore": 95,
      "reason": "Why this works...",
      "title": "Suggested title",
      "platform": "instagram",
      "duration": 45
    }
  ]
}`;

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: 'You are an expert video editor specializing in viral short-form content.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.4,
            max_tokens: 3000
        });

        const result = JSON.parse(response.choices[0].message.content || '{}');
        return result;
    } catch (error) {
        console.error('Hook extraction error:', error);
        throw new Error('Failed to extract video hooks');
    }
};

// ========================================
// CAPTION GENERATION
// ========================================

export const generateCaptions = async (
    transcript: string,
    style: 'mrbeast' | 'hormozi' | 'minimal' = 'minimal'
): Promise<any> => {
    try {
        // For MVP, we'll return the transcript formatted for captions
        // In production, you'd use word-level timestamps from Whisper

        const words = transcript.split(' ');
        const captions = [];

        let currentCaption = '';
        for (let i = 0; i < words.length; i++) {
            currentCaption += words[i] + ' ';

            // Break caption every 3-5 words for MrBeast style, 5-8 for others
            const breakPoint = style === 'mrbeast' ? 3 : 6;
            if (currentCaption.split(' ').length > breakPoint || i === words.length - 1) {
                captions.push({
                    text: currentCaption.trim(),
                    startTime: i * 0.5, // Approximate - 0.5s per word
                    endTime: (i + currentCaption.split(' ').length) * 0.5,
                    style: style
                });
                currentCaption = '';
            }
        }

        return {
            captions,
            totalDuration: words.length * 0.5,
            style
        };
    } catch (error) {
        console.error('Caption generation error:', error);
        throw new Error('Failed to generate captions');
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

Transcript:
${sourceText.substring(0, 8000)}

Respond in JSON format:
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

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: 'You are an expert video content strategist.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.6
        });

        return JSON.parse(response.choices[0].message.content || '{}');
    } catch (error: any) {
        console.error('OpenAI Video Clips error:', error);
        throw new Error(`OpenAI Video Clips generation failed: ${error.message}`);
    }
};

export default {
    transcribeAudio,
    analyzeContent,
    generateBlogPost,
    generateSocialPost,
    generateTwitterThread,
    extractVideoHooks,
    generateCaptions,
    generateVideoClips
};
