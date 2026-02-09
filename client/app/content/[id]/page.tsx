"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import {
    Sparkles,
    ArrowLeft,
    Eye,
    Wand2,
    FileText,
    TrendingUp,
    Hash,
    Heart,
    Target,
    Loader2,
    CheckCircle,
    Video,
    Music,
    Calendar,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { contentAPI, ContentAsset, AnalysisResult } from "@/lib/api";
import toast from "react-hot-toast";

export default function ContentDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const { isAuthenticated } = useAuth();
    const id = params.id as string;

    const [content, setContent] = useState<ContentAsset | null>(null);
    const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [analyzing, setAnalyzing] = useState(false);

    if (!isAuthenticated) {
        router.push("/login");
        return null;
    }

    useEffect(() => {
        loadContent();
    }, [id]);

    const loadContent = async () => {
        try {
            setLoading(true);
            const data = await contentAPI.getById(id);
            setContent(data);

            // Check if analysis exists (would be in content data)
            // For now, we'll trigger analysis manually
        } catch (error) {
            console.error("Failed to load content:", error);
            toast.error("Failed to load content");
            router.push("/content");
        } finally {
            setLoading(false);
        }
    };

    const handleAnalyze = async () => {
        if (!content) return;

        try {
            setAnalyzing(true);
            toast.loading("Analyzing content with AI...", { id: "analyze" });

            const result = await contentAPI.analyze(content.id);
            setAnalysis(result);

            toast.success("Analysis complete!", { id: "analyze" });
        } catch (error: any) {
            console.error("Analysis error:", error);
            const message = error.response?.data?.message || "Analysis failed";
            toast.error(message, { id: "analyze" });
        } finally {
            setAnalyzing(false);
        }
    };

    const getIcon = (type: string) => {
        if (type.includes("video")) return <Video className="w-8 h-8 text-purple-400" />;
        if (type.includes("audio")) return <Music className="w-8 h-8 text-pink-400" />;
        return <FileText className="w-8 h-8 text-blue-400" />;
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatFileSize = (bytes?: number) => {
        if (!bytes) return "Unknown";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
                    <p className="text-gray-400">Loading content...</p>
                </div>
            </div>
        );
    }

    if (!content) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Header */}
            <nav className="bg-white/5 backdrop-blur-lg border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link href="/content" className="flex items-center gap-2 text-gray-400 hover:text-white transition">
                            <ArrowLeft className="w-5 h-5" />
                            Back to Library
                        </Link>

                        <Link href="/dashboard" className="flex items-center gap-2">
                            <Sparkles className="w-8 h-8 text-purple-400" />
                            <span className="text-xl font-bold text-white">RepurposeX</span>
                        </Link>

                        <div className="flex items-center gap-4">
                            <Link
                                href={`/repurpose/${content.id}`}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition"
                            >
                                <Wand2 className="w-4 h-4" />
                                Repurpose Now
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Content Info */}
                <div className="mb-8">
                    <div className="flex items-start gap-4 mb-6">
                        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                            {getIcon(content.type)}
                        </div>
                        <div className="flex-1">
                            <h1 className="text-4xl font-bold text-white mb-3">{content.title}</h1>
                            {content.description && (
                                <p className="text-gray-300 text-lg mb-4">{content.description}</p>
                            )}
                            <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                                <span className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    {formatDate(content.createdAt)}
                                </span>
                                <span className="capitalize">{content.type.split("/")[0]}</span>
                                {content.fileSize && <span>{formatFileSize(content.fileSize)}</span>}
                                {content.duration && <span>{Math.floor(content.duration / 60)} minutes</span>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* AI Analysis Section */}
                <div className="grid lg:grid-cols-2 gap-8 mb-8">
                    {/* Analysis Trigger or Results */}
                    {!analysis ? (
                        <div className="lg:col-span-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-12 text-center">
                            <Sparkles className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-white mb-3">AI Content Analysis</h2>
                            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                                Use our AI to analyze this content and extract topics, keywords, sentiment, and virality potential. Get platform-specific recommendations.
                            </p>
                            <button
                                onClick={handleAnalyze}
                                disabled={analyzing}
                                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                {analyzing ? (
                                    <>
                                        <Loader2 className="w-5 h-5 inline mr-2 animate-spin" />
                                        Analyzing...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-5 h-5 inline mr-2" />
                                        Analyze with AI
                                    </>
                                )}
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Topics */}
                            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <FileText className="w-6 h-6 text-purple-400" />
                                    <h3 className="text-xl font-bold text-white">Topics</h3>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {analysis.topics.map((topic, index) => (
                                        <span
                                            key={index}
                                            className="px-4 py-2 bg-purple-600/20 text-purple-300 rounded-lg text-sm font-medium"
                                        >
                                            {topic}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Keywords */}
                            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <Hash className="w-6 h-6 text-pink-400" />
                                    <h3 className="text-xl font-bold text-white">Keywords</h3>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {analysis.keywords.map((keyword, index) => (
                                        <span
                                            key={index}
                                            className="px-3 py-1 bg-pink-600/20 text-pink-300 rounded-full text-sm"
                                        >
                                            #{keyword}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Sentiment */}
                            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <Heart className="w-6 h-6 text-red-400" />
                                    <h3 className="text-xl font-bold text-white">Sentiment</h3>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-300 capitalize">{analysis.sentiment.label}</span>
                                        <span className="text-2xl font-bold text-white">{analysis.sentiment.score}/100</span>
                                    </div>
                                    <div className="w-full bg-white/10 rounded-full h-3">
                                        <div
                                            className={`h-full rounded-full ${analysis.sentiment.score >= 70
                                                    ? "bg-green-500"
                                                    : analysis.sentiment.score >= 40
                                                        ? "bg-yellow-500"
                                                        : "bg-red-500"
                                                }`}
                                            style={{ width: `${analysis.sentiment.score}%` }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Virality Score */}
                            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <TrendingUp className="w-6 h-6 text-green-400" />
                                    <h3 className="text-xl font-bold text-white">Virality Potential</h3>
                                </div>
                                <div className="space-y-3">
                                    <div className="text-center">
                                        <div className="text-5xl font-bold text-white mb-2">{analysis.viralityScore}</div>
                                        <div className="text-gray-400">out of 100</div>
                                    </div>
                                    <div className="w-full bg-white/10 rounded-full h-3">
                                        <div
                                            className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                                            style={{ width: `${analysis.viralityScore}%` }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Platform Recommendations */}
                            <div className="lg:col-span-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <Target className="w-6 h-6 text-blue-400" />
                                    <h3 className="text-xl font-bold text-white">Best Platforms for This Content</h3>
                                </div>
                                <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
                                    {analysis.platformScores
                                        .sort((a, b) => b.score - a.score)
                                        .map((platform, index) => (
                                            <div
                                                key={index}
                                                className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-4 text-center"
                                            >
                                                <div className="text-2xl font-bold text-white mb-1">{platform.score}</div>
                                                <div className="text-sm text-gray-400 capitalize">{platform.platform}</div>
                                                <div className="w-full bg-white/10 rounded-full h-2 mt-3">
                                                    <div
                                                        className="h-full rounded-full bg-blue-500"
                                                        style={{ width: `${platform.score}%` }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>

                            {/* Success Message */}
                            <div className="lg:col-span-2 bg-green-500/10 border border-green-500/30 rounded-xl p-4 flex items-center gap-3">
                                <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
                                <div>
                                    <p className="text-green-300 font-semibold">Analysis Complete!</p>
                                    <p className="text-green-400/80 text-sm">
                                        Your content has been analyzed. Ready to repurpose into multiple formats.
                                    </p>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Action Buttons */}
                {analysis && (
                    <div className="flex justify-center gap-4">
                        <button
                            onClick={handleAnalyze}
                            disabled={analyzing}
                            className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold transition disabled:opacity-50"
                        >
                            Re-analyze
                        </button>
                        <Link
                            href={`/repurpose/${content.id}`}
                            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition transform hover:scale-105"
                        >
                            <Wand2 className="w-5 h-5 inline mr-2" />
                            Start Repurposing
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
