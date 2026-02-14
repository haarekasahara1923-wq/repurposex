"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Sparkles, Briefcase, Rocket, Target, Users, Layout,
    MessageSquare, Check, ChevronRight, ChevronLeft, Loader2
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import toast from "react-hot-toast";

const steps = [
    { title: "Business", icon: <Rocket className="w-5 h-5" /> },
    { title: "Niche", icon: <Target className="w-5 h-5" /> },
    { title: "Platforms", icon: <Layout className="w-5 h-5" /> },
    { title: "Voice", icon: <MessageSquare className="w-5 h-5" /> },
];

export default function OnboardingPage() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuth();
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const [formData, setFormData] = useState({
        businessName: "",
        businessType: "individual",
        industry: "technology",
        niche: "",
        subNiches: [] as string[],
        targetAudience: {
            ageRange: "18-35",
            interests: ""
        },
        platforms: [] as string[],
        primaryPlatform: "",
        tonePreset: "professional",
        customGuidelines: ""
    });

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                businessName: user.businessName || prev.businessName,
                businessType: user.role === 'agency' ? 'agency' : prev.businessType
            }));
        }
    }, [user]);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push("/login");
        }
    }, [isAuthenticated, router]);

    if (!mounted) return null;

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            submitOnboarding();
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const submitOnboarding = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5001';

            await axios.post(`${apiUrl}/api/v1/onboarding/complete`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            toast.success("Welcome aboard! Let's get started.");
            router.push("/dashboard");
        } catch (error: any) {
            console.error("Onboarding failed:", error);
            toast.error(error.response?.data?.message || "Failed to save profile");
        } finally {
            setLoading(false);
        }
    };

    const togglePlatform = (platform: string) => {
        setFormData(prev => ({
            ...prev,
            platforms: prev.platforms.includes(platform)
                ? prev.platforms.filter(p => p !== platform)
                : [...prev.platforms, platform]
        }));
    };

    if (!isAuthenticated) return null;

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
            {/* Logo */}
            <div className="flex items-center gap-2 mb-8">
                <Sparkles className="w-10 h-10 text-purple-400" />
                <span className="text-3xl font-bold text-white">RepurposeX</span>
            </div>

            {/* Progress Bar */}
            <div className="max-w-xl w-full mb-12">
                <div className="flex justify-between mb-4">
                    {steps.map((step, idx) => (
                        <div key={idx} className="flex flex-col items-center gap-2">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition ${idx <= currentStep ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-500'
                                }`}>
                                {idx < currentStep ? <Check className="w-5 h-5" /> : step.icon}
                            </div>
                            <span className={`text-xs ${idx <= currentStep ? 'text-purple-400 font-medium' : 'text-slate-500'}`}>
                                {step.title}
                            </span>
                        </div>
                    ))}
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                        className="bg-purple-600 h-full transition-all duration-500"
                        style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                    />
                </div>
            </div>

            {/* Form Card */}
            <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
                {currentStep === 0 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                        <h2 className="text-2xl font-bold text-white">Tell us about your business</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Business Name</label>
                                <input
                                    type="text"
                                    value={formData.businessName}
                                    onChange={e => setFormData({ ...formData, businessName: e.target.value })}
                                    className="w-full bg-slate-800 border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-purple-500"
                                    placeholder="e.g. Acme Creative"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Business Type</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {['individual', 'agency', 'brand'].map(type => (
                                        <button
                                            key={type}
                                            onClick={() => setFormData({ ...formData, businessType: type })}
                                            className={`py-3 rounded-xl border capitalize transition ${formData.businessType === type ? 'bg-purple-600/20 border-purple-600 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                                                }`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {currentStep === 1 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                        <h2 className="text-2xl font-bold text-white">What is your niche?</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Primary Niche</label>
                                <select
                                    value={formData.niche}
                                    onChange={e => setFormData({ ...formData, niche: e.target.value })}
                                    className="w-full bg-slate-800 border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-purple-500"
                                >
                                    <option value="">Select a niche</option>
                                    <option value="tech">Technology</option>
                                    <option value="finance">Finance</option>
                                    <option value="health">Health & Fitness</option>
                                    <option value="lifestyle">Lifestyle</option>
                                    <option value="business">Business & Marketing</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Target Audience Interests</label>
                                <textarea
                                    value={formData.targetAudience.interests}
                                    onChange={e => setFormData({ ...formData, targetAudience: { ...formData.targetAudience, interests: e.target.value } })}
                                    className="w-full bg-slate-800 border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-purple-500 h-24"
                                    placeholder="What do your followers love?"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {currentStep === 2 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                        <h2 className="text-2xl font-bold text-white">Select your platforms</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {['YouTube', 'Instagram', 'LinkedIn', 'Twitter', 'TikTok', 'Facebook'].map(platform => (
                                <button
                                    key={platform}
                                    onClick={() => togglePlatform(platform)}
                                    className={`p-4 rounded-xl border flex flex-col items-center gap-3 transition ${formData.platforms.includes(platform) ? 'bg-purple-600/20 border-purple-600 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                                        }`}
                                >
                                    <span className="font-medium">{platform}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {currentStep === 3 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                        <h2 className="text-2xl font-bold text-white">Voice & Tone</h2>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                {['professional', 'casual', 'viral', 'hinglish'].map(tone => (
                                    <button
                                        key={tone}
                                        onClick={() => setFormData({ ...formData, tonePreset: tone })}
                                        className={`py-4 rounded-xl border capitalize transition ${formData.tonePreset === tone ? 'bg-purple-600/20 border-purple-600 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                                            }`}
                                    >
                                        {tone}
                                    </button>
                                ))}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Custom Guidelines (Optional)</label>
                                <textarea
                                    value={formData.customGuidelines}
                                    onChange={e => setFormData({ ...formData, customGuidelines: e.target.value })}
                                    className="w-full bg-slate-800 border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-purple-500 h-24"
                                    placeholder="Any specific rules for the AI?"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-12 pt-8 border-t border-slate-800">
                    <button
                        onClick={handleBack}
                        disabled={currentStep === 0 || loading}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-slate-400 hover:text-white transition disabled:opacity-0"
                    >
                        <ChevronLeft className="w-5 h-5" />
                        Back
                    </button>
                    <button
                        onClick={handleNext}
                        disabled={loading}
                        className="flex items-center gap-2 px-10 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-purple-500/50 transition transform hover:scale-105"
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                {currentStep === steps.length - 1 ? 'Complete Setup' : 'Continue'}
                                <ChevronRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
