import axios, { AxiosInstance, AxiosError } from 'axios';

// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Create axios instance
const api: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000, // 30 seconds
});

// Request interceptor - Add auth token to requests
api.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            if (typeof window !== 'undefined') {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }
            }
        }
        return Promise.reject(error);
    }
);

// API Types
export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'agency' | 'client';
    businessName?: string;
    phone?: string;
    whatsapp?: string;
    avatarUrl?: string;
    createdAt: string;
    updatedAt: string;
    organizationId?: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface SignupRequest {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: 'agency' | 'client';
    businessName?: string;
    phone?: string;
    whatsapp?: string;
}

export interface AuthResponse {
    token: string;
    user: User;
}

export interface ContentAsset {
    id: string;
    title: string;
    description?: string;
    type: string;
    fileUrl?: string;
    filePath?: string;
    fileSize?: number;
    duration?: number;
    createdAt: string;
}

export interface AnalysisResult {
    id: string;
    contentId: string;
    topics: string[];
    keywords: string[];
    sentiment: {
        score: number;
        label: string;
    };
    viralityScore: number;
    platformScores: {
        platform: string;
        score: number;
    }[];
    hooks?: string[];
    keyInsights?: string[];
}

export interface RepurposeJob {
    id: string;
    contentId: string;
    outputType: string;
    tone: string;
    status: string;
    progress: number;
    errorMessage?: string;
    result?: any;
    createdAt: string;
}

// Auth API
export const authAPI = {
    login: async (data: LoginRequest): Promise<AuthResponse> => {
        const response = await api.post('/api/v1/auth/login', data);
        return response.data;
    },

    signup: async (data: SignupRequest): Promise<AuthResponse> => {
        // Map firstName and lastName to fullName for the backend
        const signupData = {
            email: data.email,
            password: data.password,
            fullName: `${data.firstName} ${data.lastName}`.trim(),
            role: data.role,
            businessName: data.businessName,
            phone: data.phone,
            whatsapp: data.whatsapp,
            countryCode: 'IN' // Default
        };
        const response = await api.post('/api/v1/auth/register', signupData);
        return response.data;
    },

    getCurrentUser: async (): Promise<User> => {
        const response = await api.get('/api/v1/auth/me');
        return response.data;
    },

    updateProfile: async (data: Partial<User>): Promise<User> => {
        const response = await api.put('/api/v1/auth/profile', data);
        return response.data;
    },

    logout: () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
    },
};

// Content API
export const contentAPI = {
    upload: async (formData: FormData, onProgress?: (progress: number) => void) => {
        const response = await api.post('/api/v1/content/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
                if (progressEvent.total && onProgress) {
                    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    onProgress(progress);
                }
            },
        });
        return response.data;
    },

    getAll: async (): Promise<ContentAsset[]> => {
        const response = await api.get('/api/v1/content');
        return response.data;
    },

    getById: async (id: string): Promise<ContentAsset> => {
        const response = await api.get(`/api/v1/content/${id}`);
        return response.data;
    },

    analyze: async (id: string): Promise<AnalysisResult> => {
        const response = await api.post(`/api/v1/content/${id}/analyze`);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/api/v1/content/${id}`);
    },
};

// Repurpose API
export const repurposeAPI = {
    create: async (data: {
        contentId: string;
        outputType: string;
        tone?: string;
        platforms?: string[];
    }): Promise<RepurposeJob> => {
        const response = await api.post('/api/v1/repurpose', data);
        return response.data;
    },

    getJob: async (id: string): Promise<RepurposeJob> => {
        const response = await api.get(`/api/v1/repurpose/jobs/${id}`);
        return response.data;
    },

    createBulk: async (data: {
        contentId: string;
        jobs: { outputType: string; tone?: string; config?: any }[];
    }): Promise<{ success: boolean; jobs: { id: string; outputType: string }[] }> => {
        const response = await api.post('/api/v1/repurpose/bulk', data);
        return response.data;
    },
};

// Subscription API
export const subscriptionAPI = {
    getPlans: async () => {
        const response = await api.get('/api/v1/subscriptions/plans');
        return response.data;
    },

    subscribe: async (data: { planId: string; paymentMethodId: string }) => {
        const response = await api.post('/api/v1/subscriptions/subscribe', data);
        return response.data;
    },
};

export default api;
