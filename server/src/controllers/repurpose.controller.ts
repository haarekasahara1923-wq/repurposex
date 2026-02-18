import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';
import openaiService from '../services/openai.service';
import geminiService from '../services/gemini.service';
import groqService from '../services/groq.service';
import { emailService } from '../services/email.service';

export const createBulkRepurposingJobs = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: { code: 'UNAUTHORIZED', message: 'Not authenticated' }
            });
        }

        const { contentId, jobs } = req.body; // jobs: [{ outputType, tone, config }]

        if (!contentId || !jobs || !Array.isArray(jobs)) {
            return res.status(400).json({
                success: false,
                message: 'Content ID and jobs array are required',
                error: { code: 'INVALID_INPUT' }
            });
        }

        // Verify content exists and belongs to user
        const content = await prisma.contentAsset.findFirst({
            where: {
                id: contentId,
                userId: req.user.id
            },
            include: {
                analysis: true
            }
        });

        if (!content) {
            return res.status(404).json({
                success: false,
                message: 'Content not found',
                error: { code: 'NOT_FOUND' }
            });
        }

        const createdJobs = [];

        for (const jobConfig of jobs) {
            const { outputType, tone, config = {} } = jobConfig;

            // Simple mapping as in single job creation
            let jobType = outputType;
            if (outputType.includes('blog')) jobType = 'blog';
            if (outputType.includes('linkedin')) jobType = 'linkedin';
            if (outputType.includes('twitter')) jobType = 'twitter_thread';

            const job = await prisma.repurposingJob.create({
                data: {
                    contentAssetId: contentId,
                    userId: req.user.id,
                    jobType: jobType,
                    outputFormat: outputType,
                    status: 'queued',
                    progress: 0,
                    config: { ...config, tone } as any,
                }
            });

            // Start processing asynchronously
            processRepurposingJob(job.id, content, jobType, { ...config, tone }).catch(err => {
                console.error(`Bulk Job ${job.id} processing error:`, err);
            });

            createdJobs.push({
                id: job.id,
                outputType: job.outputFormat,
                status: job.status
            });
        }

        res.status(201).json({
            success: true,
            message: `${createdJobs.length} jobs created successfully`,
            jobs: createdJobs
        });
    } catch (error: any) {
        console.error('Bulk repurposing error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create bulk jobs',
            error: { code: 'BULK_FAILED', details: error.message }
        });
    }
};

// Internal processing function (already exists below, but I'll make sure it's accessible or just keep the existing structure)
// For now, I'll just assume processRepurposingJob is available in the scope or I'll move it.


export const createRepurposingJob = async (req: AuthRequest, res: Response) => {
    try {
        console.log('Repurposing job request body:', req.body);
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: { code: 'UNAUTHORIZED', message: 'Not authenticated' }
            });
        }

        const {
            contentId,
            contentAssetId: bodyAssetId,
            outputType,
            jobType: bodyJobType,
            tone,
            config = {}
        } = req.body;

        const assetId = contentId || bodyAssetId;
        const rawJobType = outputType || bodyJobType;

        if (!assetId || !rawJobType) {
            return res.status(400).json({
                success: false,
                message: 'Content ID and output type are required',
                error: { code: 'INVALID_INPUT' }
            });
        }

        // Map frontend types to backend types if necessary
        let jobType = rawJobType;
        if (rawJobType.includes('blog')) jobType = 'blog';
        if (rawJobType.includes('linkedin')) jobType = 'linkedin';
        if (rawJobType.includes('twitter')) jobType = 'twitter_thread';
        if (rawJobType.includes('instagram')) jobType = 'instagram';
        if (rawJobType.includes('facebook')) jobType = 'facebook';
        if (rawJobType.includes('youtube')) jobType = 'youtube';

        // Verify content exists and belongs to user
        const content = await prisma.contentAsset.findFirst({
            where: {
                id: assetId,
                userId: req.user.id
            },
            include: {
                analysis: true
            }
        });

        if (!content) {
            return res.status(404).json({
                success: false,
                message: 'Content not found',
                error: { code: 'CONTENT_NOT_FOUND' }
            });
        }

        // Create job
        const job = await prisma.repurposingJob.create({
            data: {
                contentAssetId: assetId,
                userId: req.user.id,
                jobType,
                outputFormat: rawJobType,
                config: { ...config, tone },
                status: 'processing',
                targetPlatforms: [rawJobType]
            }
        });

        // Process job immediately
        processRepurposingJob(job.id, content, jobType, { ...config, tone }).catch(error => {
            console.error('Job processing error:', error);
        });

        res.status(202).json({
            success: true,
            id: job.id,
            jobId: job.id,
            status: 'processing',
            message: 'Repurposing job started'
        });
    } catch (error: any) {
        console.error('Create repurposing job error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to create repurposing job',
            error: { code: 'JOB_CREATE_FAILED', details: error.toString() }
        });
    }
};

export const getJobStatus = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: { code: 'UNAUTHORIZED', message: 'Not authenticated' }
            });
        }

        const { id } = req.params;

        const job = await prisma.repurposingJob.findFirst({
            where: {
                id,
                userId: req.user.id
            },
            include: {
                generatedContent: {
                    select: {
                        id: true,
                        title: true,
                        contentText: true,
                        caption: true,
                        hashtags: true,
                        cta: true,
                        metadata: true,
                        contentType: true,
                        targetPlatform: true,
                        qualityScore: true,
                        createdAt: true
                    }
                }
            }
        });

        if (!job) {
            return res.status(404).json({
                success: false,
                error: { code: 'JOB_NOT_FOUND', message: 'Job not found' }
            });
        }

        res.json({
            success: true,
            id: job.id,
            jobId: job.id,
            status: job.status,
            progress: job.progress,
            errorMessage: job.errorMessage,
            startedAt: job.startedAt,
            completedAt: job.completedAt,
            generatedContent: job.generatedContent,
            result: job.generatedContent[0] || null
        });
    } catch (error) {
        console.error('Get job status error:', error);
        res.status(500).json({
            success: false,
            error: { code: 'FETCH_FAILED', message: 'Failed to fetch job status' }
        });
    }
};

// ========================================
// BACKGROUND JOB PROCESSING
// ========================================

async function processRepurposingJob(
    jobId: string,
    content: any,
    jobType: string,
    config: any
) {
    try {
        // Update job status
        await prisma.repurposingJob.update({
            where: { id: jobId },
            data: {
                status: 'processing',
                startedAt: new Date(),
                progress: 10
            }
        });

        // Get or create analysis - Extract actual content
        console.log('Content details:', {
            id: content.id,
            title: content.title,
            contentType: content.contentType,
            hasAnalysis: !!content.analysis,
            analysisTranscript: content.analysis?.transcript?.substring(0, 100)
        });

        let transcript = '';

        // Try to get transcript from analysis first
        if (content.analysis?.transcript) {
            transcript = content.analysis.transcript;
            console.log('Using transcript from analysis');
        }
        // For documents, try to extract text content
        else if (content.contentType === 'document') {
            // If we have stored text content in metadata
            if (content.metadata && typeof content.metadata === 'object') {
                const metadata = content.metadata as any;
                transcript = metadata.extractedText || metadata.content || metadata.text || '';
            }

            // If still no content, use title and description as fallback
            if (!transcript || transcript.length < 50) {
                transcript = `Document Title: ${content.title}\n\nDescription: ${content.description || 'No description provided'}\n\nNote: Full document text extraction pending. This is a placeholder based on available metadata.`;
                console.warn('Warning: No extracted text found for document. Using metadata fallback.');
            } else {
                console.log(`Using extracted text from document (${transcript.length} chars)`);
            }
        }
        // For other content types, use available metadata
        else {
            transcript = content.description || content.title || 'Sample content for demonstration';
            console.log('Using description/title as content');
        }

        console.log(`Final transcript length: ${transcript.length} characters`);
        if (transcript.length < 100) {
            console.warn('Warning: Transcript is very short, generated content may not be relevant');
        }

        // Select AI service
        // Priority: Groq (Fast/Free) -> Gemini -> OpenAI
        let aiService: any;
        if (process.env.GROQ_API_KEY) {
            aiService = groqService;
            console.log('Using AI Service: Groq');
        } else if (process.env.GEMINI_API_KEY) {
            aiService = geminiService;
            console.log('Using AI Service: Gemini');
        } else {
            aiService = openaiService;
            console.log('Using AI Service: OpenAI');
        }

        // Generate content based on job type
        let result;
        let generatedContents = [];

        switch (jobType) {
            case 'blog':
            case 'newsletter':
            case 'mail':
            case 'post':
                // Generate multiple pieces if requested
                // CRITICAL FIX: Check numPieces (from frontend) not just numBlogs/pieces
                const numPieces = config.numPieces || config.numBlogs || config.pieces || config.count || 1;
                const contentStyle = jobType; // blog, newsletter, mail, or post

                console.log(`Generating ${numPieces} ${contentStyle}(s) from content`);
                console.log('Config received:', JSON.stringify(config, null, 2));

                // Validate number of pieces
                if (numPieces < 1 || numPieces > 10) {
                    throw new Error(`Invalid number of pieces: ${numPieces}. Must be between 1 and 10.`);
                }

                for (let i = 0; i < numPieces; i++) {
                    // Add variety instruction for multiple pieces
                    const varietyPrompt = numPieces > 1
                        ? `IMPORTANT INSTRUCTION: You are generating ${contentStyle} #${i + 1} of a series of ${numPieces} posts based on the content below.\n\n` +
                        `Your GOAL is to write a unique piece that covers a SPECIFIC part, angle, or sub-topic of the content, distinctive from other posts in this series.\n` +
                        `- If the content has multiple sections/chapters, focus ONLY on section ${i + 1} or the concepts relevant to this specific part.\n` +
                        `- Do NOT summarize the entire document again.\n` +
                        `- Dig deep into a specific aspect rather than a broad overview.\n\n`
                        : '';

                    const contentPrompt = varietyPrompt + "SOURCE CONTENT:\n" + transcript;
                    const wordCount = config.wordCount || 1500;

                    console.log(`Generating ${contentStyle} ${i + 1}/${numPieces} with ${wordCount} words target...`);

                    // Generate based on  style
                    let generatedResult;
                    if (contentStyle === 'newsletter') {
                        generatedResult = await aiService.generateBlogPost(
                            `Create a NEWSLETTER format from this content:\n${contentPrompt}`,
                            wordCount
                        );
                    } else if (contentStyle === 'mail') {
                        generatedResult = await aiService.generateBlogPost(
                            `Create an EMAIL CAMPAIGN format from this content:\n${contentPrompt}`,
                            wordCount
                        );
                    } else if (contentStyle === 'post') {
                        generatedResult = await aiService.generateBlogPost(
                            `Create a SOCIAL THREAD/POST format from this content:\n${contentPrompt}`,
                            wordCount
                        );
                    } else {
                        generatedResult = await aiService.generateBlogPost(contentPrompt, wordCount);
                    }

                    generatedContents.push({
                        title: `${generatedResult.title}${numPieces > 1 ? ` (Part ${i + 1})` : ''}`,
                        contentText: generatedResult.content,
                        contentType: contentStyle === 'blog' ? 'blog_article' : `${contentStyle}_content`,
                        targetPlatform: contentStyle === 'mail' ? 'email' : 'website',
                        metadata: {
                            keywords: generatedResult.keywords,
                            metaDescription: generatedResult.metaDescription,
                            pieceNumber: i + 1,
                            totalPieces: numPieces,
                            style: contentStyle,
                            wordCount: generatedResult.content?.split(' ').length || 0
                        }
                    });

                    console.log(`Generated ${contentStyle} ${i + 1}: "${generatedResult.title}"`);

                    // Update progress
                    const progress = 30 + Math.round((i + 1) / numPieces * 50);
                    await prisma.repurposingJob.update({
                        where: { id: jobId },
                        data: { progress }
                    });
                }
                break;

            case 'linkedin':
                result = await aiService.generateSocialPost(transcript, 'linkedin', config.tone || 'professional');
                generatedContents.push({
                    title: 'LinkedIn Post',
                    contentText: result.content,
                    caption: result.content,
                    hashtags: result.hashtags || [],
                    cta: result.cta,
                    contentType: 'social_post',
                    targetPlatform: 'linkedin'
                });
                break;

            case 'twitter_thread':
                result = await aiService.generateTwitterThread(transcript, config.threadLength || 10);
                generatedContents.push({
                    title: 'Twitter Thread',
                    contentText: result.tweets?.join('\n\n') || '',
                    contentType: 'twitter_thread',
                    targetPlatform: 'twitter',
                    metadata: { tweets: result.tweets }
                });
                break;

            case 'instagram':
                result = await aiService.generateSocialPost(transcript, 'instagram', config.tone || 'casual');
                generatedContents.push({
                    title: 'Instagram Caption',
                    contentText: result.content,
                    caption: result.content,
                    hashtags: result.hashtags || [],
                    contentType: 'social_post',
                    targetPlatform: 'instagram'
                });
                break;

            case 'video_to_shorts':
            case 'youtube': // Mapping youtube as video clips too for now
                result = await aiService.generateVideoClips(transcript, config.numShorts || 6);
                if (result.clips && Array.isArray(result.clips)) {
                    for (const clip of result.clips) {
                        generatedContents.push({
                            title: clip.title,
                            contentText: clip.hook,
                            caption: clip.hook,
                            contentType: 'short_video',
                            targetPlatform: 'youtube',
                            fileUrl: content.fileUrl, // Important: use parent video URL
                            metadata: {
                                startTime: clip.startTime,
                                endTime: clip.endTime,
                                hook: clip.hook
                            }
                        });
                    }
                }
                break;

            default:
                throw new Error('Unsupported job type');
        }

        // Save generated content
        await prisma.repurposingJob.update({
            where: { id: jobId },
            data: { progress: 80 }
        });

        for (const contentData of generatedContents) {
            await prisma.generatedContent.create({
                data: {
                    repurposingJobId: jobId,
                    contentAssetId: content.id,
                    userId: content.userId,
                    ...contentData,
                    qualityScore: 85 // Mock quality score
                }
            });
        }

        // Mark job as completed
        await prisma.repurposingJob.update({
            where: { id: jobId },
            data: {
                status: 'completed',
                progress: 100,
                completedAt: new Date()
            }
        });

        // Send Job Completion Email (Fetch user separately to be safe with types)
        const job = await prisma.repurposingJob.findUnique({ where: { id: jobId } });
        if (job) {
            const user = await prisma.user.findUnique({ where: { id: job.userId } });
            if (user) {
                emailService.sendJobCompletionEmail(
                    user.email,
                    user.fullName,
                    jobType.charAt(0).toUpperCase() + jobType.slice(1)
                ).catch(err => console.error('Failed to send job completion email:', err));
            }
        }

    } catch (error) {
        console.error('Job processing failed:', error);
        await prisma.repurposingJob.update({
            where: { id: jobId },
            data: {
                status: 'failed',
                errorMessage: error instanceof Error ? error.message : 'Unknown error',
                failedAt: new Date()
            }
        });
    }
}
