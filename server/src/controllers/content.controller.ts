import { Request, Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';
import fs from 'fs/promises';
import path from 'path';
import openaiService from '../services/openai.service';
import geminiService from '../services/gemini.service';
import { emailService } from '../services/email.service';

export const uploadContent = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: { code: 'UNAUTHORIZED', message: 'Not authenticated' }
            });
        }

        const { title, description, contentType, tags, url } = req.body;

        if (!req.file && !url) {
            return res.status(400).json({
                success: false,
                error: { code: 'INPUT_REQUIRED', message: 'No file or URL provided' }
            });
        }

        // Create content asset record
        const content = await prisma.contentAsset.create({
            data: {
                userId: req.user.id,
                title: title || (req.file ? req.file.originalname : 'URL Import'),
                description,
                contentType: contentType || 'unknown',
                fileUrl: req.file ? req.file.path : url,
                fileSize: req.file ? BigInt(req.file.size) : 0n,
                mimeType: req.file ? req.file.mimetype : 'text/url',
                sourceUrl: url || null,
                sourcePlatform: url ? (url.includes('youtube') ? 'youtube' : 'other') : 'upload',
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

        // BigInt (fileSize) needs string conversion for JSON serialization
        const safeContents = contents.map(item => ({
            ...item,
            fileSize: item.fileSize ? item.fileSize.toString() : null
        }));

        res.json(safeContents);
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

        const safeContent = {
            ...content,
            fileSize: content.fileSize ? content.fileSize.toString() : null
        };

        res.json(safeContent);
    } catch (error) {
        console.error('Get content error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch content',
            error: { code: 'FETCH_FAILED' }
        });
    }
};

export const analyzeContent = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated',
                error: { code: 'UNAUTHORIZED' }
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
                message: 'Content not found',
                error: { code: 'NOT_FOUND' }
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

        // Select AI service
        const useGemini = !!process.env.GEMINI_API_KEY;
        const aiService = useGemini ? geminiService : openaiService;
        console.log(`Using AI Service for Analysis: ${useGemini ? 'Gemini' : 'OpenAI'} `);

        // Analyze with AI
        const analysis = await aiService.analyzeContent(textToAnalyze);

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
            contentId: content.id,
            analysis: contentAnalysis
        });

        // Send Analysis Success Email
        emailService.sendJobCompletionEmail(req.user.email, req.user.fullName, 'Analysis').catch(err => {
            console.error('Failed to send analysis success email:', err);
        });
    } catch (error) {
        console.error('Analyze content error:', error);
        res.status(500).json({
            success: false,
            error: { code: 'ANALYSIS_FAILED', message: 'Failed to analyze content' }
        });
    }
};
