"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import {
    Sparkles,
    ArrowLeft,
    Wand2,
    Loader2,
    CheckCircle,
    FileText,
    Linkedin,
    Twitter,
    Instagram,
    Youtube,
    Facebook,
    Copy,
    Download,
    RefreshCw,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { contentAPI, repurposeAPI, ContentAsset, RepurposeJob } from "@/lib/api";
import toast from "react-hot-toast";

export default function RepurposePage() {
    const router = useRouter();
    const params = useParams();
    const { isAuthenticated } = useAuth();
    const id = params.id as string;

    const [content, setContent] = useState<ContentAsset | null>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [job, setJob] = useState<RepurposeJob | null>(null);
    const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

    const [options, setOptions] = useState({
        outputType: "linkedin_post",
        tone: "professional",
        platforms: [] as string[],
    });

    if (!isAuthenticated) {
        router.push("/login");
        return null;
    }

    useEffect(() => {
        loadContent();
        return () => {
            if (pollingInterval) clearInterval(pollingInterval);
        };
    }, [id]);

    const loadContent = async () => {
        try {
            setLoading(true);
            const data = await contentAPI.getById(id);
            setContent(data);
        } catch (error) {
            console.error("Failed to load content:", error);
            toast.error("Failed to load content");
            router.push("/content");
        } finally {
            setLoading(false);
        }
    };

    const startRepurposing = async () => {
        if (!content) return;

        try {
            setProcessing(true);
            toast.loading("Creating repurposing job...", { id: "repurpose" });

            const newJob = await repurposeAPI.create({
                contentId: content.id,
                outputType: options.outputType,
                tone: options.tone,
                platforms: options.platforms,
            });

            setJob(newJob);
            toast.success("Job created! Processing...", { id: "repurpose" });

            // Start polling for job status
            const interval = setInterval(async () => {
                try {
                    const updatedJob = await repurposeAPI.getJob(newJob.id);
                    setJob(updatedJob);

                    if (updatedJob.status === "completed") {
                        clearInterval(interval);
                        setProcessing(false);
                        toast.success("Repurposing complete!", { id: "repurpose" });
                    } else if (updatedJob.status === "failed") {
                        clearInterval(interval);
                        setProcessing(false);
                        toast.error("Repurposing failed", { id: "repurpose" });
                    }
                } catch (error) {
                    console.error("Failed to poll job:", error);
                }
            }, 3000); // Poll every 3 seconds

            setPollingInterval(interval);
        } catch (error: any) {
            console.error("Repurpose error:", error);
            const message = error.response?.data?.message || "Failed to create job";
            toast.error(message, { id: "repurpose" });
            setProcessing(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard!");
    };

    const downloadContent = (text: string, filename: string) => {
        const element = document.createElement("a");
        const file = new Blob([text], { type: "text/plain" });
        element.href = URL.createObjectURL(file);
        element.download = filename;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        toast.success("Downloaded!");
    };

    const getPlatformIcon = (platform: string) => {
        const icons: any = {
            linkedin: <Linkedin className="w-5 h-5" />,
            twitter: <Twitter className="w-5 h-5" />,
            instagram: <Instagram className="w-5 h-5" />,
            youtube: <Youtube className="w-5 h-5" />,
            facebook: <Facebook className="w-5 h-5" />,
        };
        return icons[platform.toLowerCase()] || <FileText className="w-5 h-5" />;
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

    if (!content) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Header */}
            <nav className="bg-white/5 backdrop-blur-lg border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link
                            href={`/content/${content.id}`}
                            className="flex items-center gap-2 text-gray-400 hover:text-white transition"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Back to Content
                        </Link>

                        <Link href="/dashboard" className="flex items-center gap-2">
                            <Sparkles className="w-8 h-8 text-purple-400" />
                            <span className="text-xl font-bold text-white">RepurposeX</span>
                        </Link>

                        <div className="w-32" /> {/* Spacer for centering */}
                    </div>
                </div>
            </nav>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Title */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white mb-3">AI Content Repurposing</h1>
                    <p className="text-gray-400">Transform "{content.title}" into platform-optimized content</p>
                </div>

                {!job ? (
                    <>
                        {/* Repurposing Options */}
                        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 mb-8">
                            <h2 className="text-2xl font-bold text-white mb-6">Choose Output Format</h2>

                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                                {[
                                    { value: "blog_post", label: "Blog Post", desc: "1500+ word article" },
                                    { value: "linkedin_post", label: "LinkedIn Post", desc: "Professional narrative" },
                                    { value: "twitter_thread", label: "Twitter Thread", desc: "10-tweet thread" },
                                    { value: "instagram_caption", label: "Instagram Caption", desc: "Visual-first copy" },
                                    { value: "youtube_description", label: "YouTube Description", desc: "SEO optimized" },
                                    { value: "facebook_post", label: "Facebook Post", desc: "Conversational" },
                                ].map((format) => (
                                    <button
                                        key={format.value}
                                        onClick={() => setOptions({ ...options, outputType: format.value })}
                                        className={`p-4 rounded-xl border-2 transition text-left ${options.outputType === format.value
                                                ? "border-purple-500 bg-purple-500/20"
                                                : "border-white/10 bg-white/5 hover:border-white/30"
                                            }`}
                                    >
                                        <div className="font-semibold text-white mb-1">{format.label}</div>
                                        <div className="text-sm text-gray-400">{format.desc}</div>
                                    </button>
                                ))}
                            </div>

                            <h3 className="text-xl font-bold text-white mb-4">Choose Tone</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                {[
                                    { value: "professional", label: "Professional" },
                                    { value: "casual", label: "Casual" },
                                    { value: "viral", label: "Viral" },
                                    { value: "hinglish", label: "Hinglish" },
                                ].map((tone) => (
                                    <button
                                        key={tone.value}
                                        onClick={() => setOptions({ ...options, tone: tone.value })}
                                        className={`px-6 py-3 rounded-xl font-semibold transition ${options.tone === tone.value
                                                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                                                : "bg-white/10 text-gray-300 hover:bg-white/20"
                                            }`}
                                    >
                                        {tone.label}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={startRepurposing}
                                disabled={processing}
                                className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold text-lg hover:shadow-lg hover:shadow-purple-500/50 transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="w-6 h-6 inline mr-2 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Wand2 className="w-6 h-6 inline mr-2" />
                                        Generate Content with AI
                                    </>
                                )}
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        {/* Job Progress */}
                        {job.status !== "completed" && (
                            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 mb-8">
                                <div className="text-center">
                                    <Loader2 className="w-16 h-16 text-purple-400 animate-spin mx-auto mb-4" />
                                    <h2 className="text-2xl font-bold text-white mb-2">AI is Working...</h2>
                                    <p className="text-gray-400 mb-6">
                                        Analyzing and repurposing your content. This may take a minute.
                                    </p>
                                    <div className="max-w-md mx-auto">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm text-gray-300">Progress</span>
                                            <span className="text-sm text-purple-400">{job.progress || 0}%</span>
                                        </div>
                                        <div className="w-full bg-white/10 rounded-full h-3">
                                            <div
                                                className="bg-gradient-to-r from-purple-600 to-pink-600 h-full rounded-full transition-all duration-500"
                                                style={{ width: `${job.progress || 0}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Generated Content */}
                        {job.status === "completed" && job.result && (
                            <div className="space-y-6">
                                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 flex items-center gap-3 mb-6">
                                    <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
                                    <div>
                                        <p className="text-green-300 font-semibold">Content Generated Successfully!</p>
                                        <p className="text-green-400/80 text-sm">
                                            Your repurposed content is ready. Copy, download, or schedule it.
                                        </p>
                                    </div>
                                </div>

                                {/* Generated Content Card */}
                                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-2xl font-bold text-white">Generated Content</h2>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => copyToClipboard(job.result.content || job.result.contentText)}
                                                className="px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 rounded-lg transition flex items-center gap-2"
                                            >
                                                <Copy className="w-4 h-4" />
                                                Copy
                                            </button>
                                            <button
                                                onClick={() =>
                                                    downloadContent(
                                                        job.result.content || job.result.contentText,
                                                        `${content.title}-${options.outputType}.txt`
                                                    )
                                                }
                                                className="px-4 py-2 bg-pink-600/20 hover:bg-pink-600/30 text-pink-400 rounded-lg transition flex items-center gap-2"
                                            >
                                                <Download className="w-4 h-4" />
                                                Download
                                            </button>
                                        </div>
                                    </div>

                                    {job.result.title && (
                                        <div className="mb-4">
                                            <h3 className="text-sm font-medium text-gray-400 mb-2">Title</h3>
                                            <p className="text-xl font-semibold text-white">{job.result.title}</p>
                                        </div>
                                    )}

                                    <div className="mb-6">
                                        <h3 className="text-sm font-medium text-gray-400 mb-2">Content</h3>
                                        <div className="bg-white/5 rounded-xl p-6 max-h-96 overflow-y-auto">
                                            <pre className="text-gray-200 whitespace-pre-wrap font-sans">
                                                {job.result.content || job.result.contentText}
                                            </pre>
                                        </div>
                                    </div>

                                    {job.result.hashtags && job.result.hashtags.length > 0 && (
                                        <div className="mb-6">
                                            <h3 className="text-sm font-medium text-gray-400 mb-2">Hashtags</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {job.result.hashtags.map((tag: string, index: number) => (
                                                    <span
                                                        key={index}
                                                        className="px-3 py-1 bg-blue-600/20 text-blue-300 rounded-full text-sm"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {job.result.cta && (
                                        <div className="mb-6">
                                            <h3 className="text-sm font-medium text-gray-400 mb-2">Call-to-Action</h3>
                                            <p className="text-gray-200">{job.result.cta}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex justify-center gap-4">
                                    <button
                                        onClick={() => {
                                            setJob(null);
                                            setProcessing(false);
                                        }}
                                        className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold transition flex items-center gap-2"
                                    >
                                        <RefreshCw className="w-5 h-5" />
                                        Generate Another
                                    </button>
                                    <Link
                                        href="/schedule"
                                        className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition"
                                    >
                                        Schedule Post
                                    </Link>
                                </div>
                            </div>
                        )}

                        {/* Failed State */}
                        {job.status === "failed" && (
                            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
                                <p className="text-red-300 font-semibold mb-4">Repurposing Failed</p>
                                <button
                                    onClick={() => {
                                        setJob(null);
                                        setProcessing(false);
                                    }}
                                    className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold transition"
                                >
                                    Try Again
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
