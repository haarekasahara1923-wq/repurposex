import { Request, Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';
import fs from 'fs/promises';
import path from 'path';
import openaiService from '../services/openai.service';

export const uploadContent = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: { code: 'UNAUTHORIZED', message: 'Not authenticated' }
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: { code: 'FILE_REQUIRED', message: 'No file uploaded' }
            });
        }

        const { title, description, contentType, tags } = req.body;

        // Create content asset record
        const content = await prisma.contentAsset.create({
            data: {
                userId: req.user.id,
                title: title || req.file.originalname,
                description,
                contentType: contentType || 'unknown',
                fileUrl: req.file.path,
                fileSize: BigInt(req.file.size),
                mimeType: req.file.mimetype,
                uploadStatus: 'completed',
                tags: tags ? tags.split(',') : [],
                processingCompletedAt: new Date()
            }
        });

        res.status(201).json({
            success: true,
            id: content.id,
            title: content.title,
            contentType: content.contentType,
            fileUrl: content.fileUrl,
            uploadStatus: content.uploadStatus,
            createdAt: content.createdAt
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            success: false,
            error: { code: 'UPLOAD_FAILED', message: 'Failed to upload content' }
        });
    }
};

export const getContentList = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: { code: 'UNAUTHORIZED', message: 'Not authenticated' }
            });
        }

        const { page = '1', limit = '20' } = req.query;
        const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

        const [contents, total] = await Promise.all([
            prisma.contentAsset.findMany({
                where: {
                    userId: req.user.id,
                    deletedAt: null
                },
                select: {
                    id: true,
                    title: true,
                    contentType: true,
                    thumbnailUrl: true,
                    duration: true,
                    uploadStatus: true,
                    createdAt: true,
                    tags: true,
                    fileSize: true,
                    description: true
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: parseInt(limit as string)
            }),
            prisma.contentAsset.count({
                where: {
                    userId: req.user.id,
                    deletedAt: null
                }
            })
        ]);

        // Just return the array for simplicity if frontend expects Array
        // Or if it expects items, return items directly.
        // Looking at frontend: data = await contentAPI.getAll(); setContent(data);
        // It expects an array.
        res.json(contents);
    } catch (error) {
        console.error('Get content list error:', error);
        res.status(500).json({
            success: false,
            error: { code: 'FETCH_FAILED', message: 'Failed to fetch content' }
        });
    }
};

export const getContentById = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: { code: 'UNAUTHORIZED', message: 'Not authenticated' }
            });
        }

        const { id } = req.params;

        const content = await prisma.contentAsset.findFirst({
            where: {
                id,
                userId: req.user.id,
                deletedAt: null
            },
            include: {
                analysis: true
            }
        });

        if (!content) {
            return res.status(404).json({
                success: false,
                error: { code: 'NOT_FOUND', message: 'Content not found' }
            });
        }

        res.json({ success: true, data: content });
    } catch (error) {
        console.error('Get content error:', error);
        res.status(500).json({
            success: false,
            error: { code: 'FETCH_FAILED', message: 'Failed to fetch content' }
        });
    }
};

export const analyzeContent = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: { code: 'UNAUTHORIZED', message: 'Not authenticated' }
            });
        }

        const { id } = req.params;

        // Get content
        const content = await prisma.contentAsset.findFirst({
            where: {
                id,
                userId: req.user.id
            }
        });

        if (!content) {
            return res.status(404).json({
                success: false,
                error: { code: 'NOT_FOUND', message: 'Content not found' }
            });
        }

        // For MVP: Simple text analysis
        // In production, you'd handle audio/video transcription first
        let textToAnalyze = '';

        if (content.contentType === 'video' || content.contentType === 'audio') {
            // TODO: Implement actual transcription
            textToAnalyze = 'Sample content for demonstration';
        } else {
            // Read text file
            textToAnalyze = await fs.readFile(content.fileUrl, 'utf-8');
        }

        // Analyze with OpenAI
        const analysis = await openaiService.analyzeContent(textToAnalyze);

        // Store analysis
        const contentAnalysis = await prisma.contentAnalysis.create({
            data: {
                contentAssetId: content.id,
                transcript: textToAnalyze,
                topics: analysis.topics || [],
                keywords: analysis.keywords || [],
                sentimentScore: analysis.sentiment?.score,
                viralityScore: analysis.viralityScore,
                platformScores: analysis.platformScores || {},
                keyInsights: analysis.keyInsights || []
            }
        });

        res.json({
            success: true,
            data: {
                contentId: content.id,
                analysis: contentAnalysis
            }
        });
    } catch (error) {
        console.error('Analyze content error:', error);
        res.status(500).json({
            success: false,
            error: { code: 'ANALYSIS_FAILED', message: 'Failed to analyze content' }
        });
    }
};
