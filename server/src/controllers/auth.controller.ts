import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';
import { emailService } from '../services/email.service';

// ========================================
// VALIDATION SCHEMAS
// ========================================

const registerSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    fullName: z.string().min(2, 'Full name is required'),
    role: z.enum(['agency', 'client']).default('client'),
    businessName: z.string().optional(),
    phone: z.string().optional(),
    whatsapp: z.string().optional(),
    countryCode: z.string().optional().default('IN')
});

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required')
});

// ========================================
// HELPER FUNCTIONS
// ========================================

const generateTokens = (userId: string, email: string) => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET not configured');
    }

    const accessToken = jwt.sign({ userId, email }, secret, {
        expiresIn: '1h'
    });

    const refreshToken = jwt.sign({ userId, email }, secret, {
        expiresIn: '30d'
    });

    return { accessToken, refreshToken };
};

// ========================================
// CONTROLLERS
// ========================================

export const register = async (req: Request, res: Response) => {
    try {
        // Validate input
        const validatedData = registerSchema.parse(req.body);

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: validatedData.email }
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'EMAIL_EXISTS',
                    message: 'Email already registered'
                }
            });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(validatedData.password, 12);

        // Create user and organization in a transaction
        const result = await prisma.$transaction(async (tx) => {
            // Create user
            const user = await tx.user.create({
                data: {
                    email: validatedData.email,
                    passwordHash,
                    fullName: validatedData.fullName,
                    role: validatedData.role,
                    phone: validatedData.phone,
                    whatsapp: validatedData.whatsapp,
                    countryCode: validatedData.countryCode
                }
            });

            // If agency, create organization
            let organization = null;
            if (validatedData.role === 'agency' && validatedData.businessName) {
                organization = await tx.organization.create({
                    data: {
                        name: validatedData.businessName,
                        slug: validatedData.businessName.toLowerCase().replace(/ /g, '-'),
                        ownerId: user.id,
                        type: 'agency'
                    }
                });

                // Add user as owner member
                await tx.organizationMember.create({
                    data: {
                        organizationId: organization.id,
                        userId: user.id,
                        role: 'owner',
                        status: 'active'
                    }
                });
            }

            return { user, organization };
        });

        const { user } = result;

        // Generate tokens
        const { accessToken, refreshToken } = generateTokens(user.id, user.email);

        // Create session
        await prisma.session.create({
            data: {
                userId: user.id,
                token: refreshToken,
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'],
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
            }
        });

        // Send Welcome Email (Background)
        emailService.sendWelcomeEmail(user.email, user.fullName).catch(err => {
            console.error('Failed to send welcome email:', err);
        });

        res.status(201).json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
                phone: user.phone,
                whatsapp: user.whatsapp,
                createdAt: user.createdAt
            },
            token: accessToken,
            refreshToken,
            expiresIn: 3600
        });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid input data',
                    details: error.errors
                }
            });
        }

        console.error('Register error:', error);
        return res.status(500).json({
            success: false,
            error: {
                code: 'REGISTRATION_FAILED',
                message: 'Registration failed. Please try again.'
            }
        });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        // Validate input
        const validatedData = loginSchema.parse(req.body);

        // Find user
        const user = await prisma.user.findUnique({
            where: { email: validatedData.email }
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'INVALID_CREDENTIALS',
                    message: 'Invalid email or password'
                }
            });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(
            validatedData.password,
            user.passwordHash
        );

        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'INVALID_CREDENTIALS',
                    message: 'Invalid email or password'
                }
            });
        }

        // Check if account is active
        if (user.status !== 'active') {
            return res.status(403).json({
                success: false,
                error: {
                    code: 'ACCOUNT_INACTIVE',
                    message: 'Your account is not active'
                }
            });
        }

        // Generate tokens
        const { accessToken, refreshToken } = generateTokens(user.id, user.email);

        // Create session
        await prisma.session.create({
            data: {
                userId: user.id,
                token: refreshToken,
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'],
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            }
        });

        // Update last login
        await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() }
        });

        res.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                avatarUrl: user.avatarUrl,
                role: user.role,
                phone: user.phone,
                whatsapp: user.whatsapp
            },
            token: accessToken,
            refreshToken,
            expiresIn: 3600
        });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid input data',
                    details: error.errors
                }
            });
        }

        console.error('Login error:', error);
        return res.status(500).json({
            success: false,
            error: {
                code: 'LOGIN_FAILED',
                message: 'Login failed. Please try again.'
            }
        });
    }
};

export const getCurrentUser = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'Not authenticated'
                }
            });
        }

        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                email: true,
                fullName: true,
                avatarUrl: true,
                role: true,
                phone: true,
                whatsapp: true,
                countryCode: true,
                timezone: true,
                language: true,
                emailVerified: true,
                createdAt: true,
                organizations: {
                    where: { status: 'active' },
                    take: 1,
                    select: {
                        organizationId: true,
                        organization: {
                            select: { name: true }
                        }
                    }
                }
            }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'USER_NOT_FOUND',
                    message: 'User not found'
                }
            });
        }

        const userData = {
            ...user,
            organizationId: user.organizations[0]?.organizationId,
            businessName: user.organizations[0]?.organization?.name,
            organizations: undefined // Remove from clean response
        };

        res.json(userData);
    } catch (error) {
        console.error('Get current user error:', error);
        return res.status(500).json({
            success: false,
            error: {
                code: 'FETCH_USER_FAILED',
                message: 'Failed to fetch user data'
            }
        });
    }
};

export const refreshToken = async (req: Request, res: Response) => {
    try {
        const { refreshToken: token } = req.body;

        if (!token) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'TOKEN_REQUIRED',
                    message: 'Refresh token is required'
                }
            });
        }

        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error('JWT_SECRET not configured');
        }

        // Verify token
        const decoded = jwt.verify(token, secret) as { userId: string; email: string };

        // Check if session exists
        const session = await prisma.session.findUnique({
            where: { token }
        });

        if (!session) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'INVALID_TOKEN',
                    message: 'Invalid refresh token'
                }
            });
        }

        // Check if session expired
        if (session.expiresAt < new Date()) {
            await prisma.session.delete({ where: { token } });
            return res.status(401).json({
                success: false,
                error: {
                    code: 'TOKEN_EXPIRED',
                    message: 'Refresh token has expired'
                }
            });
        }

        // Generate new access token
        const { accessToken: newAccessToken } = generateTokens(decoded.userId, decoded.email);

        res.json({
            success: true,
            data: {
                accessToken: newAccessToken,
                expiresIn: 3600
            }
        });
    } catch (error: any) {
        console.error('Refresh token error:', error);
        return res.status(401).json({
            success: false,
            error: {
                code: 'TOKEN_REFRESH_FAILED',
                message: 'Failed to refresh token'
            }
        });
    }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'Not authenticated'
                }
            });
        }

        const { firstName, lastName, phone, businessName, whatsapp, avatarUrl } = req.body;

        let fullName = undefined;
        if (firstName || lastName) {
            const currentUser = await prisma.user.findUnique({ where: { id: req.user.id } });
            const currentParts = currentUser?.fullName.split(' ') || [];
            const fName = firstName || currentParts[0] || '';
            const lName = lastName || (currentParts.length > 1 ? currentParts.slice(1).join(' ') : '');
            fullName = `${fName} ${lName}`.trim();
        }

        const user = await prisma.user.update({
            where: { id: req.user.id },
            data: {
                fullName: fullName || undefined,
                phone,
                whatsapp,
                avatarUrl,
            }
        });

        // Update organization name if businessName is provided and user is owner
        if (businessName && user.role === 'agency') {
            const membership = await prisma.organizationMember.findFirst({
                where: { userId: user.id, role: 'owner' }
            });

            if (membership) {
                await prisma.organization.update({
                    where: { id: membership.organizationId },
                    data: { name: businessName }
                });
            }
        }

        res.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
                phone: user.phone,
                whatsapp: user.whatsapp,
                avatarUrl: user.avatarUrl
            }
        });
    } catch (error) {
        console.error('Update profile error:', error);
        return res.status(500).json({
            success: false,
            error: {
                code: 'UPDATE_FAILED',
                message: 'Failed to update profile'
            }
        });
    }
};
