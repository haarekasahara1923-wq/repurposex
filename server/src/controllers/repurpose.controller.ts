import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';
import openaiService from '../services/openai.service';

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

        // Get or create analysis
        let transcript = content.analysis?.transcript || 'Sample content for demonstration';

        // Generate content based on job type
        let result;
        let generatedContents = [];

        switch (jobType) {
            case 'blog':
                result = await openaiService.generateBlogPost(transcript, config.wordCount || 1500);
                generatedContents.push({
                    title: result.title,
                    contentText: result.content,
                    contentType: 'blog_article',
                    targetPlatform: 'website',
                    metadata: { keywords: result.keywords, metaDescription: result.metaDescription }
                });
                break;

            case 'linkedin':
                result = await openaiService.generateSocialPost(transcript, 'linkedin', config.tone || 'professional');
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
                result = await openaiService.generateTwitterThread(transcript, config.threadLength || 10);
                generatedContents.push({
                    title: 'Twitter Thread',
                    contentText: result.tweets?.join('\n\n') || '',
                    contentType: 'twitter_thread',
                    targetPlatform: 'twitter',
                    metadata: { tweets: result.tweets }
                });
                break;

            case 'instagram':
                result = await openaiService.generateSocialPost(transcript, 'instagram', config.tone || 'casual');
                generatedContents.push({
                    title: 'Instagram Caption',
                    contentText: result.content,
                    caption: result.content,
                    hashtags: result.hashtags || [],
                    contentType: 'social_post',
                    targetPlatform: 'instagram'
                });
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
