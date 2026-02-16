import { Request, Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';
import fs from 'fs/promises';
import path from 'path';
import openaiService from '../services/openai.service';
import geminiService from '../services/gemini.service';
import { emailService } from '../services/email.service';
import axios from 'axios';
const pdfParse = require('pdf-parse');

export const uploadContent = async (req: AuthRequest, res: Response) => {
    try {
        // Comprehensive request logging
        console.log('====== UPLOAD REQUEST RECEIVED ======');
        console.log('Headers:', {
            'content-type': req.headers['content-type'],
            'content-length': req.headers['content-length'],
            'authorization': req.headers.authorization ? 'Present' : 'Missing'
        });
        console.log('Body keys:', Object.keys(req.body));
        console.log('Body:', req.body);
        console.log('File object:', req.file ? {
            fieldname: req.file.fieldname,
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
            path: req.file.path
        } : 'No file attached');
        console.log('=====================================');

        if (!req.user) {
            console.error('Upload rejected: User not authenticated');
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
        const filePath = req.file ? req.file.path.replace(/\\/g, '/') : url;
        const normalizedFileUrl = filePath && !filePath.startsWith('http') && !filePath.startsWith('/') ? `/${filePath}` : filePath;

        // Auto-detect type if unknown
        let finalContentType = contentType;
        if (!finalContentType || finalContentType === 'unknown') {
            const mime = req.file?.mimetype || '';
            if (mime.startsWith('video/')) finalContentType = 'video';
            else if (mime.startsWith('audio/')) finalContentType = 'audio';
            else if (mime.startsWith('image/')) finalContentType = 'image';
            else if (mime === 'text/plain' || mime.includes('pdf') || mime.includes('msword') || mime.includes('document')) finalContentType = 'document';
            else if (url?.includes('youtube.com') || url?.includes('youtu.be')) finalContentType = 'video';
            else finalContentType = 'unknown';
        }

        console.log('Creating content asset:', {
            userId: req.user.id,
            title: title || (req.file ? req.file.originalname : 'URL Import'),
            finalContentType,
            fileUrl: normalizedFileUrl
        });

        const content = await prisma.contentAsset.create({
            data: {
                userId: req.user.id,
                title: title || (req.file ? req.file.originalname : 'URL Import'),
                description,
                contentType: finalContentType,
                fileUrl: normalizedFileUrl,
                fileSize: req.file ? BigInt(req.file.size) : 0n,
                mimeType: req.file ? req.file.mimetype : (url ? 'text/url' : 'unknown'),
                sourceUrl: url || null,
                sourcePlatform: url ? (url.includes('youtube') ? 'youtube' : 'other') : 'upload',
                uploadStatus: 'completed',
                tags: tags ? tags.split(',') : [],
                processingCompletedAt: new Date()
            }
        });

        console.log('Content created successfully:', content.id);

        res.status(201).json({
            success: true,
            id: content.id,
            title: content.title,
            contentType: content.contentType,
            fileUrl: content.fileUrl,
            uploadStatus: content.uploadStatus,
            createdAt: content.createdAt
        });
    } catch (error: any) {
        console.error('Upload error:', error);
        console.error('Error stack:', error.stack);

        // Provide more specific error messages
        let errorMessage = 'Failed to upload content';
        let errorCode = 'UPLOAD_FAILED';

        if (error.message?.includes('Cloudinary')) {
            errorMessage = 'File upload service not configured. Please contact administrator.';
            errorCode = 'SERVICE_NOT_CONFIGURED';
        } else if (error.message?.includes('File type')) {
            errorMessage = error.message;
            errorCode = 'INVALID_FILE_TYPE';
        } else if (error.message?.includes('File too large')) {
            errorMessage = 'File size exceeds maximum limit of 2GB';
            errorCode = 'FILE_TOO_LARGE';
        }

        res.status(500).json({
            success: false,
            error: {
                code: errorCode,
                message: errorMessage,
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            }
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

        if (
            content.contentType === 'video' ||
            content.contentType === 'audio' ||
            content.fileUrl.startsWith('http') ||
            content.sourceUrl
        ) {
            // TODO: Implement actual transcription or scraping for URLs
            // For now, providing a safe fallback for the MVP
            textToAnalyze = `Content Analysis for: ${content.title}. 
            
            This appears to be video/audio content or an external URL. 
            For this MVP/Demo version, we are simulating the transcription.
            
            Context based on metadata:
            Title: ${content.title}
            Description: ${content.description || 'No description provided'}
            Tags: ${(content.tags || []).join(', ')}`;
        } else {
            // Read text/document file from local filesystem
            try {
                let fsPath = content.fileUrl;
                if (fsPath.startsWith('http')) {
                    // Fetch from Cloudinary/Remote URL  
                    console.log(`Fetching remote file for analysis: ${fsPath}`);
                    const response = await axios.get(fsPath, { responseType: 'arraybuffer' });

                    // Check if it's a PDF
                    if (content.mimeType === 'application/pdf' || fsPath.toLowerCase().endsWith('.pdf')) {
                        console.log('Extracting text from remote PDF...');
                        const pdfData = await pdfParse(response.data);
                        textToAnalyze = pdfData.text;
                        console.log(`Extracted ${textToAnalyze.length} characters from PDF`);
                    } else {
                        textToAnalyze = typeof response.data === 'string' ? response.data : Buffer.from(response.data).toString('utf-8');
                    }
                } else {
                    if (fsPath.startsWith('/uploads')) {
                        const uploadDir = process.env.VERCEL ? '/tmp/uploads' : path.join(process.cwd(), 'uploads');
                        fsPath = path.join(uploadDir, fsPath.substring(8));
                    } else if (!fsPath.startsWith('/tmp') && !fsPath.startsWith('C:') && !fsPath.startsWith('/')) {
                        // It's a relative path, assume in uploads
                        const uploadDir = process.env.VERCEL ? '/tmp/uploads' : path.join(process.cwd(), 'uploads');
                        fsPath = path.join(uploadDir, fsPath);
                    }

                    console.log(`Analyzing file at: ${fsPath}`);

                    // Check if it's a PDF based on mime type or extension
                    if (content.mimeType === 'application/pdf' || fsPath.toLowerCase().endsWith('.pdf')) {
                        console.log('Extracting text from local PDF...');
                        const dataBuffer = await fs.readFile(fsPath);
                        const pdfData = await pdfParse(dataBuffer);
                        textToAnalyze = pdfData.text;
                        console.log(`Extracted ${textToAnalyze.length} characters from PDF`);
                    } else {
                        // Plain text file
                        textToAnalyze = await fs.readFile(fsPath, 'utf-8');
                    }
                }
            } catch (err: any) {
                console.warn(`Failed to read file at ${content.fileUrl}, using metadata instead:`, err.message);
                textToAnalyze = `Title: ${content.title}\nDescription: ${content.description || ''}`;
            }
        }

        // Select AI service with better error handling
        let aiService: any;
        let serviceName = 'Unknown';

        try {
            // Priority: Groq (Fast/Free) -> Gemini -> OpenAI
            if (process.env.GROQ_API_KEY) {
                const groqService = require('../services/groq.service');
                aiService = groqService;
                serviceName = 'Groq';
            } else if (process.env.GEMINI_API_KEY) {
                aiService = geminiService;
                serviceName = 'Gemini';
            } else if (process.env.OPENAI_API_KEY) {
                aiService = openaiService;
                serviceName = 'OpenAI';
            } else {
                console.warn('No AI service API key configured! Using fallback analysis.');
                aiService = null;
            }

            console.log(`Using AI Service for Analysis: ${serviceName}`);
            console.log(`Text to analyze length: ${textToAnalyze.length} characters`);
        } catch (serviceError) {
            console.error('Error selecting AI service:', serviceError);
            aiService = null;
        }

        // Analyze with AI (with fallback)
        let analysis: any;

        try {
            if (aiService && aiService.analyzeContent) {
                console.log('Starting AI analysis...');
                analysis = await aiService.analyzeContent(textToAnalyze);
                console.log('AI analysis completed successfully');
            } else {
                throw new Error('No AI service available');
            }
        } catch (aiError: any) {
            console.error('AI analysis failed, using fallback:', aiError.message);

            // Fallback: Create basic analysis from content
            const words = textToAnalyze.split(/\s+/);
            const sentences = textToAnalyze.split(/[.!?]+/);

            analysis = {
                topics: content.tags || ['General'],
                keywords: words
                    .filter((w: string) => w.length > 5)
                    .slice(0, 10)
                    .map((w: string) => w.toLowerCase()),
                sentiment: {
                    score: 0.5,
                    label: 'neutral'
                },
                viralityScore: 50,
                platformScores: {
                    'twitter': 50,
                    'linkedin': 50,
                    'instagram': 50,
                    'youtube': 50
                },
                keyInsights: [
                    `Document contains ${words.length} words and ${sentences.length} sentences`,
                    `Title: ${content.title}`,
                    `Type: ${content.contentType}`
                ]
            };

            console.log('Fallback analysis created');
        }

        // Store or Update analysis
        const contentAnalysis = await prisma.contentAnalysis.upsert({
            where: { contentAssetId: content.id },
            update: {
                transcript: textToAnalyze,
                topics: analysis.topics || [],
                keywords: analysis.keywords || [],
                sentimentScore: analysis.sentiment?.score || 0.5,
                viralityScore: analysis.viralityScore || 50,
                platformScores: analysis.platformScores || {},
                keyInsights: analysis.keyInsights || []
            },
            create: {
                contentAssetId: content.id,
                transcript: textToAnalyze,
                topics: analysis.topics || [],
                keywords: analysis.keywords || [],
                sentimentScore: analysis.sentiment?.score || 0.5,
                viralityScore: analysis.viralityScore || 50,
                platformScores: analysis.platformScores || {},
                keyInsights: analysis.keyInsights || []
            }
        });

        console.log('Analysis saved/updated successfully:', contentAnalysis.id);

        res.json({
            success: true,
            contentId: content.id,
            analysis: contentAnalysis
        });

        // Send Analysis Success Email
        emailService.sendJobCompletionEmail(req.user.email, req.user.fullName, 'Analysis').catch(err => {
            console.error('Failed to send analysis success email:', err);
        });
    } catch (error: any) {
        console.error('Analyze content error:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            success: false,
            error: {
                code: 'ANALYSIS_FAILED',
                message: error.message || 'Failed to analyze content',
                details: process.env.NODE_ENV === 'development' ? error.stack : undefined
            }
        });
    }
};
