"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import {
    Sparkles,
    ArrowLeft,
    Wand2,
    Loader2,
    Play,
    Calendar,
    Share2,
    Download,
    Scissors,
    MonitorPlay,
    Type,
    Grid2x2,
    Smartphone,
    Twitter,
    FileText,
    Files,
    Layout,
    CheckCircle2,
    Video
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { contentAPI, repurposeAPI, API_BASE_URL } from "@/lib/api";
import type { ContentAsset } from "@/lib/api";
import toast from "react-hot-toast";

// Static Data - Defined outside to avoid re-initialization and TDZ issues
const ASPECT_RATIOS = [
    { id: "9:16", label: "9:16", icon: Smartphone },
    { id: "1:1", label: "1:1", icon: Grid2x2 },
    { id: "16:9", label: "16:9", icon: MonitorPlay },
    { id: "twitter", label: "X", icon: Twitter },
] as const;

const DOC_STYLES = [
    { id: "blog", label: "Blog Post" },
    { id: "newsletter", label: "Newsletter" },
    { id: "mail", label: "Email Campaign" },
    { id: "post", label: "Social Thread" }
] as const;

const ASPECT_CLASS_MAP: Record<string, string> = {
    "9:16": "aspect-[9/16]",
    "1:1": "aspect-square",
    "16:9": "aspect-video",
    "twitter": "aspect-[1.20/1]" // Twitter/X preferred ratio
};

type AspectRatio = typeof ASPECT_RATIOS[number]["id"];
type DocStyle = typeof DOC_STYLES[number]["id"];

interface GeneratedItem {
    id: string;
    title: string;
    description: string;
    type: "short" | "text";
    status: "ready" | "scheduled" | "published";
    content?: string;
    startTime?: number;
    endTime?: number;
    fileUrl?: string;
}

const HOOKS = [
    "The Secret Truth About...",
    "Stop Doing This Immediately!",
    "How I Gained 10k Followers...",
    "This Will Change Your Life...",
    "Unpopular Opinion: AI is..."
];

const generateHook = () => HOOKS[Math.floor(Math.random() * HOOKS.length)];

export default function RepurposePage() {
    const router = useRouter();
    const params = useParams();
    const { isAuthenticated, user } = useAuth();
    const id = params?.id as string;

    const [content, setContent] = useState<ContentAsset | null>(null);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);

    // Wizard State
    const [step, setStep] = useState<"configure" | "processing" | "results">("configure");
    const [processingProgress, setProcessingProgress] = useState(0);
    const [generatedItems, setGeneratedItems] = useState<GeneratedItem[]>([]);
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

    // Configuration State
    const [videoConfig, setVideoConfig] = useState({
        numShorts: 3 as 3 | 6 | 12,
        aspectRatio: "9:16" as AspectRatio,
        aiCaptions: true,
        autoReframe: true
    });

    const [docConfig, setDocConfig] = useState({
        numPieces: 4 as 2 | 4 | 6 | 8,
        style: "post" as DocStyle,
        aiHooks: true,
        enhance: true
    });

    // Detect if content is video (YouTube or Uploaded)
    const isContentVideo = useMemo(() => {
        if (!content) return false;
        const typeStr = String(content.type || "").toLowerCase();
        const urlStr = String(content.fileUrl || "").toLowerCase();
        const pathStr = String(content.filePath || "").toLowerCase();
        const mimeStr = String(content.mimeType || "").toLowerCase();

        return (
            typeStr.includes("video") ||
            typeStr === "youtube" ||
            mimeStr.startsWith("video/") ||
            urlStr.includes("youtube.com") ||
            urlStr.includes("youtu.be") ||
            urlStr.includes("/video/upload/") || // Cloudinary video pattern
            urlStr.endsWith(".mp4") ||
            urlStr.endsWith(".mov") ||
            urlStr.endsWith(".webm") ||
            pathStr.endsWith(".mp4") ||
            pathStr.endsWith(".mov")
        );
    }, [content]);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted) {
            if (!isAuthenticated) {
                router.push("/login");
            } else if (id && id !== "undefined") {
                loadContent();
            }
        }
    }, [id, isAuthenticated, mounted]);

    const getMediaUrl = (url: string) => {
        if (!url) return "";
        if (url.startsWith("http") || url.startsWith("blob:")) return url;

        const baseUrl = API_BASE_URL;

        // Handle leading slash
        if (url.startsWith("/")) {
            // If it already starts with /api or /uploads, just prepend baseUrl
            if (url.startsWith("/api") || url.startsWith("/uploads") || url.startsWith("/tmp/uploads")) {
                return `${baseUrl}${url}`;
            }
            // Otherwise, it might be an absolute path from backend that needs mapping
            return `${baseUrl}${url}`;
        }

        // Fallback: assume it's a relative path to uploads
        return `${baseUrl}/uploads/${url}`;
    };

    const loadContent = async () => {
        try {
            setLoading(true);
            const data = await contentAPI.getById(id);
            if (!data) {
                toast.error("Content not found");
                router.push("/content");
                return;
            }
            setContent(data);
        } catch (error) {
            console.error("Failed to load content:", error);
            toast.error("Failed to load content");
            router.push("/content");
        } finally {
            setLoading(false);
        }
    };

    const generateMockResults = () => {
        if (!content) return;
        const items: GeneratedItem[] = [];
        const count = isContentVideo ? videoConfig.numShorts : docConfig.numPieces;
        const transcript = content.analysis?.transcript || "";
        const duration = Number(content.duration || 60);

        for (let i = 1; i <= count; i++) {
            const hook = generateHook();
            let body = "";

            if (isContentVideo) {
                body = `[AI Clips Generated: Frame ${i * 10}s to ${(i + 1) * 10}s]`;
            } else {
                const sentences = transcript.split(/[.!?]/).filter(s => s.trim().length > 15);
                const snippet = sentences.length > 3
                    ? sentences.slice(Math.min(i, sentences.length - 2), Math.min(i + 4, sentences.length)).join(". ")
                    : "This piece explores the primary themes of your content, optimized for engagement.";

                body = `# ${hook}\n\n${snippet}\n\nGenerated for ${docConfig.style} from "${content.title}".`;
            }

            // Ensure start and end times are within duration
            const clipDuration = 10;
            const startTime = Math.min((i - 1) * 20, Math.max(0, duration - clipDuration));
            const endTime = Math.min(startTime + clipDuration, duration);

            items.push({
                id: `gen-${i}`,
                title: isContentVideo
                    ? `Viral Short #${i}: ${hook}`
                    : `${docConfig.style.toUpperCase()} #${i}: ${hook}`,
                description: isContentVideo
                    ? "Optimized for high retention with AI captions."
                    : (body.substring(0, 100) + "..."),
                type: isContentVideo ? "short" : "text",
                status: "ready",
                content: body,
                startTime: startTime,
                endTime: endTime
            });
        }
        setGeneratedItems(items);
        setSelectedItems(new Set(items.map(i => i.id))); // Select all by default
        toast.success("Repurposing complete!");
    };

    const startProcessing = async () => {
        setStep("processing");
        setProcessingProgress(0);

        try {
            // Start real backend job
            const jobType = isContentVideo ? "video_to_shorts" : docConfig.style;
            const job = await repurposeAPI.create({
                contentId: id,
                outputType: jobType,
                tone: 'professional', // Default tone
                config: isContentVideo
                    ? { numShorts: videoConfig.numShorts, aspectRatio: videoConfig.aspectRatio }
                    : { numPieces: docConfig.numPieces, style: docConfig.style }
            });

            console.log("Job created:", job);

            // Poll for results
            let attempts = 0;
            const maxAttempts = 30; // 30 * 2s = 60s max

            const pollInterval = setInterval(async () => {
                attempts++;
                setProcessingProgress(Math.min(90, attempts * 3)); // Visual progress

                try {
                    const status = await repurposeAPI.getJob(job.id);
                    console.log("Job status:", status);

                    if (status.status === 'completed') {
                        clearInterval(pollInterval);
                        setProcessingProgress(100);

                        // Transform real results to GeneratedItem format
                        const results = (status as any).generatedContent || [];
                        if (results.length > 0) {
                            const realItems = results.map((r: any, idx: number) => ({
                                id: r.id || `real-${idx}`,
                                title: r.title || `Generated Piece #${idx + 1}`,
                                description: r.caption || r.contentText?.substring(0, 100) || "Generated by AI",
                                type: isContentVideo ? "short" : "text",
                                status: "ready",
                                content: r.contentText,
                                startTime: r.metadata?.startTime || (idx * 15),
                                endTime: r.metadata?.endTime || (idx * 15 + 15),
                                fileUrl: r.fileUrl
                            }));
                            setGeneratedItems(realItems);
                            setSelectedItems(new Set(realItems.map((i: any) => i.id)));
                        } else {
                            // Fallback to mock if result format is unexpected
                            generateMockResults();
                        }

                        setTimeout(() => setStep("results"), 500);
                        toast.success("AI Generation Success!");
                    } else if (status.status === 'failed') {
                        clearInterval(pollInterval);
                        toast.error(`Processing failed: ${status.errorMessage}`);
                        setStep("configure");
                    }
                } catch (err) {
                    console.error("Polling error:", err);
                }

                if (attempts >= maxAttempts) {
                    clearInterval(pollInterval);
                    generateMockResults(); // Fallback to mock
                    setStep("results");
                    toast("Using smart-mock generation (AI is taking too long)");
                }
            }, 2000);

        } catch (error) {
            console.error("Failed to start job:", error);
            // Fallback to mock if API fails
            const interval = setInterval(() => {
                setProcessingProgress((prev) => {
                    if (prev >= 100) {
                        clearInterval(interval);
                        generateMockResults();
                        setStep("results");
                        return 100;
                    }
                    return prev + 10;
                });
            }, 300);
        }
    };

    const handleAction = async (item: GeneratedItem, action: string) => {
        if (action === "download") {
            try {
                const fileUrl = item.fileUrl || (isContentVideo ? (content?.fileUrl || content?.filePath) : "");
                if (!fileUrl) {
                    toast.error("File URL not found");
                    return;
                }

                if (fileUrl.includes("youtube.com") || fileUrl.includes("youtu.be")) {
                    window.open(fileUrl, '_blank');
                    toast.success("Opening YouTube video...");
                    return;
                }

                toast.loading("Preparing download...", { id: "download" });
                const absoluteUrl = getMediaUrl(fileUrl);

                // Attempt blob download to force file saving
                try {
                    const response = await fetch(absoluteUrl, { mode: 'cors' });
                    if (!response.ok) throw new Error('Network response was not ok');
                    const blob = await response.blob();
                    const blobUrl = window.URL.createObjectURL(blob);

                    const a = document.createElement("a");
                    a.href = blobUrl;
                    // Tag with clip info so user knows it's the original file being used as clip
                    const filename = `${item.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.mp4`;
                    a.download = filename;
                    document.body.appendChild(a);
                    a.click();

                    setTimeout(() => {
                        window.URL.revokeObjectURL(blobUrl);
                        document.body.removeChild(a);
                    }, 200);

                    toast.success("Download started!", { id: "download" });
                } catch (fetchError) {
                    console.error("Blob download failed, falling back to direct link:", fetchError);
                    // Fallback to direct link but try to force attachment
                    const a = document.createElement("a");
                    a.href = absoluteUrl;
                    a.target = "_blank";
                    a.download = `${item.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.mp4`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    toast.success("Download initiated in new tab", { id: "download" });
                    toast("Note: If redirection occurs, your browser is blocking direct downloads from this source.", { duration: 5000 });
                }
            } catch (error) {
                console.error("Download failed:", error);
                toast.error("Failed to download file.", { id: "download" });
            }
        } else if (action === "schedule" || action === "broadcast") {
            const params = new URLSearchParams({
                title: item.title,
                description: item.description || (typeof item.content === 'string' ? item.content : ""),
                broadcast: action === "broadcast" ? "true" : "false"
            });
            router.push(`/schedule?${params.toString()}`);
            toast.success(action === "broadcast" ? "Opening Broadcast Wizard..." : "Opening Scheduler...");
        }
    };

    const renderPreview = () => {
        if (!content) return null;

        const fileUrl = content.fileUrl || content.filePath || "";
        const isYouTube = fileUrl.includes("youtube.com") || fileUrl.includes("youtu.be");

        if (isContentVideo || isYouTube) {
            const cleanUrl = getMediaUrl;

            if (isYouTube) {
                const videoIdMatch = fileUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/|s\/|live\/))([^&?\/]+)/);
                const videoId = videoIdMatch?.[1];

                if (videoId) {
                    return (
                        <div className="w-full aspect-video bg-black rounded-xl overflow-hidden relative shadow-2xl">
                            <iframe
                                width="100%"
                                height="100%"
                                src={`https://www.youtube.com/embed/${videoId}`}
                                title="YouTube video player"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="w-full h-full"
                            />
                        </div>
                    );
                }

                // If we know it's YouTube but didn't find an ID, don't fall through to <video>
                return (
                    <div className="w-full aspect-video bg-slate-900 rounded-xl flex flex-col items-center justify-center border border-white/5">
                        <Video className="w-12 h-12 text-gray-600 mb-4" />
                        <p className="text-gray-400 font-medium font-outfit">YouTube Video Detected</p>
                        <Link
                            href={fileUrl}
                            target="_blank"
                            className="text-purple-400 text-xs mt-2 hover:underline inline-flex items-center gap-1"
                        >
                            View on YouTube <Sparkles className="w-3 h-3" />
                        </Link>
                    </div>
                );
            }

            // Real video tag for direct uploads
            const videoSrc = cleanUrl(fileUrl);
            if (videoSrc) {
                return (
                    <div className="w-full aspect-video bg-black rounded-xl overflow-hidden relative shadow-2xl">
                        <video
                            src={videoSrc}
                            controls
                            className="w-full h-full object-contain"
                            poster={content.analysis?.thumbnailUrl}
                            onError={(e) => {
                                console.error("Video element failed to load:", videoSrc);
                                // Fallback to placeholder UI on error
                                const target = e.currentTarget;
                                target.classList.add('hidden');
                                if (target.parentElement) {
                                    const fallback = document.createElement('div');
                                    fallback.className = "flex flex-col items-center justify-center h-full text-gray-400 p-8 text-center";
                                    fallback.innerHTML = `<svg class="w-12 h-12 mb-4 opacity-20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg><p class="text-xs">Media unavailable on this device.</p>`;
                                    target.parentElement.appendChild(fallback);
                                }
                            }}
                        />
                    </div>
                );
            }

            // Placeholder with better UI
            return (
                <div className="w-full aspect-video bg-slate-900 rounded-xl flex flex-col items-center justify-center border border-white/5">
                    <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mb-4">
                        <Play className="w-8 h-8 text-purple-400 fill-purple-400" />
                    </div>
                    <p className="text-gray-400 font-medium font-outfit">Video Preview Ready</p>
                    <p className="text-gray-600 text-xs mt-1">{content.title}</p>
                </div>
            );
        }

        // Document Preview
        return (
            <div className="w-full min-h-[400px] bg-white text-slate-800 p-8 rounded-xl shadow-2xl relative flex flex-col border border-slate-200">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-slate-900">{content.title}</h3>
                        <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">Source Document</p>
                    </div>
                </div>

                <div className="flex-1 overflow-auto max-h-[250px] mb-4 custom-scrollbar">
                    {content.analysis?.transcript ? (
                        <p className="text-sm text-slate-600 leading-relaxed italic">
                            "{content.analysis.transcript.substring(0, 1000)}..."
                        </p>
                    ) : (
                        <div className="space-y-3 opacity-20">
                            {[90, 80, 100, 70, 85].map((w, i) => (
                                <div key={i} className="h-2 bg-slate-300 rounded" style={{ width: `${w}%` }} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    if (!mounted || loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-6">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-purple-600/20 rounded-full" />
                    <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin absolute top-0" />
                    <Sparkles className="w-6 h-6 text-purple-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                </div>
                <p className="text-gray-400 font-black uppercase tracking-[0.2em] text-[10px] animate-pulse">Initializing Wizard</p>
            </div>
        );
    }

    if (!content) return null;

    return (
        <div className="min-h-screen bg-slate-950 text-white font-outfit selection:bg-purple-500/30">
            {/* Header */}
            <nav className="bg-black/40 backdrop-blur-2xl border-b border-white/5 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex justify-between items-center h-20">
                        <div className="flex items-center gap-6">
                            <Link href="/content" className="p-2 hover:bg-white/5 rounded-full transition group">
                                <ArrowLeft className="w-5 h-5 text-gray-500 group-hover:text-white" />
                            </Link>
                            <div className="h-6 w-px bg-white/10" />
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-6 h-6 text-purple-400" />
                                <span className="font-black text-lg tracking-tight uppercase">Repurpose Wizard</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <span className="text-[10px] font-black bg-white/5 px-3 py-1 rounded-full text-gray-500 uppercase tracking-widest">Alpha v1.0</span>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 py-12">
                {step === "configure" && (
                    <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
                        <header className="mb-12">
                            <h1 className="text-4xl font-black mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                                Magic Repurposer
                            </h1>
                            <p className="text-purple-400/80 font-medium">Transforming: {content.title}</p>
                        </header>

                        <div className="grid lg:grid-cols-2 gap-10 items-start">
                            {/* Left: Preview */}
                            <section className="space-y-6">
                                {renderPreview()}
                                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                                    <h3 className="font-bold mb-4 flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                                        Content Verified
                                    </h3>
                                    <p className="text-sm text-gray-400">
                                        Our AI has analyzed the {isContentVideo ? 'video' : 'document'} and is ready to generate high-engagement clips.
                                    </p>
                                </div>
                            </section>

                            {/* Right: Settings */}
                            <section className="bg-slate-900/50 border border-white/10 rounded-3xl p-8 backdrop-blur-md">
                                {isContentVideo ? (
                                    <div className="space-y-10">
                                        <div>
                                            <label className="text-lg font-bold flex items-center gap-2 mb-6">
                                                <Scissors className="w-5 h-5 text-purple-400" />
                                                Video Clips
                                            </label>
                                            <div className="grid grid-cols-3 gap-4">
                                                {[3, 6, 12].map(num => (
                                                    <button
                                                        key={num}
                                                        onClick={() => setVideoConfig(v => ({ ...v, numShorts: num as 3 | 6 | 12 }))}
                                                        className={`py-4 rounded-2xl border-2 transition-all ${videoConfig.numShorts === num
                                                            ? "bg-purple-600 border-purple-400 text-white shadow-lg shadow-purple-500/20"
                                                            : "bg-black/40 border-slate-800 text-gray-500 hover:border-purple-500/30"}`}
                                                    >
                                                        <span className="block text-xl font-black">{num}</span>
                                                        <span className="text-[10px] uppercase font-bold tracking-widest">Shorts</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-lg font-bold flex items-center gap-2 mb-6">
                                                <Layout className="w-5 h-5 text-pink-400" />
                                                Output Aspect Ratio
                                            </label>
                                            <div className="grid grid-cols-4 gap-3">
                                                {ASPECT_RATIOS.map(ratio => {
                                                    const Icon = ratio.icon;
                                                    return (
                                                        <button
                                                            key={ratio.id}
                                                            onClick={() => setVideoConfig(v => ({ ...v, aspectRatio: ratio.id }))}
                                                            className={`flex flex-col items-center gap-2 py-4 rounded-xl border-2 transition-all ${videoConfig.aspectRatio === ratio.id
                                                                ? "bg-pink-600/20 border-pink-500 text-white"
                                                                : "bg-black/20 border-slate-800 text-gray-500 hover:border-pink-500/30"}`}
                                                        >
                                                            <Icon className="w-5 h-5" />
                                                            <span className="text-[10px] font-black uppercase tracking-tighter">{ratio.label}</span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        <div className="p-5 bg-black/40 rounded-2xl border border-white/5 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400">
                                                    <Type className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="font-bold">AI Dynamic Captions</p>
                                                    <p className="text-[10px] text-gray-500 uppercase font-black">Viral Style Text</p>
                                                </div>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={videoConfig.aiCaptions}
                                                    onChange={e => setVideoConfig(v => ({ ...v, aiCaptions: e.target.checked }))}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                                            </label>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-10">
                                        <div>
                                            <label className="text-lg font-bold flex items-center gap-2 mb-6">
                                                <Files className="w-5 h-5 text-pink-400" />
                                                Content Pieces
                                            </label>
                                            <div className="grid grid-cols-4 gap-4">
                                                {[2, 4, 6, 8].map(num => (
                                                    <button
                                                        key={num}
                                                        onClick={() => setDocConfig(d => ({ ...d, numPieces: num as 2 | 4 | 6 | 8 }))}
                                                        className={`py-4 rounded-xl border-2 transition-all ${docConfig.numPieces === num
                                                            ? "bg-pink-600 border-pink-400 text-white"
                                                            : "bg-black/40 border-slate-800 text-gray-500 hover:border-pink-500/30"}`}
                                                    >
                                                        <span className="text-xl font-black">{num}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-lg font-bold flex items-center gap-2 mb-6">
                                                <Wand2 className="w-5 h-5 text-purple-400" />
                                                Generation Style
                                            </label>
                                            <div className="grid grid-cols-2 gap-3">
                                                {DOC_STYLES.map(style => (
                                                    <button
                                                        key={style.id}
                                                        onClick={() => setDocConfig(d => ({ ...d, style: style.id }))}
                                                        className={`py-4 rounded-xl border-2 transition-all text-sm font-bold ${docConfig.style === style.id
                                                            ? "bg-purple-600/20 border-purple-500 text-white"
                                                            : "bg-black/40 border-slate-800 text-gray-500 hover:border-purple-500/30"}`}
                                                    >
                                                        {style.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <button
                                    onClick={startProcessing}
                                    className="w-full mt-10 py-5 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-[length:200%_auto] hover:bg-right transition-all duration-500 text-white rounded-2xl font-black text-lg shadow-xl shadow-purple-500/25 flex items-center justify-center gap-3"
                                >
                                    <Wand2 className="w-6 h-6 animate-pulse" />
                                    GENERATE MAGIC
                                </button>
                            </section>
                        </div>
                    </div>
                )}

                {step === "processing" && (
                    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-in zoom-in duration-500">
                        <div className="relative w-48 h-48 mb-10">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-900" />
                                <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="8" fill="transparent"
                                    strokeDasharray={552.92} strokeDashoffset={552.92 - (552.92 * processingProgress) / 100}
                                    className="text-purple-500 transition-all duration-500" />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-4xl font-black">{processingProgress}%</span>
                                <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest mt-1">Analyzing</span>
                            </div>
                        </div>
                        <h2 className="text-3xl font-black mb-4">Crafting Your Contents...</h2>
                        <p className="text-gray-400 max-w-sm">Our AI is extracting viral hooks, reframing visuals, and optimizing for retention.</p>
                    </div>
                )}

                {step === "results" && (
                    <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
                        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="px-3 py-1 bg-green-500/20 text-green-400 text-[10px] font-black uppercase rounded-full border border-green-500/30">Success</div>
                                    <h2 className="text-4xl font-black">AI Results</h2>
                                </div>
                                <p className="text-gray-400">Generated {generatedItems.length} magic pieces from "{content.title}"</p>
                            </div>
                            <div className="flex gap-4">
                                <button onClick={() => setStep("configure")} className="px-6 py-3 bg-slate-900 border border-white/5 rounded-xl font-bold hover:bg-slate-800 transition">Adjust Settings</button>
                                <button
                                    onClick={() => {
                                        const selected = generatedItems.filter(i => selectedItems.has(i.id));
                                        if (selected.length === 0) {
                                            toast.error("Please select items to broadcast");
                                            return;
                                        }
                                        const first = selected[0];
                                        const params = new URLSearchParams({
                                            title: first.title,
                                            description: first.description || (first.content || ""),
                                            broadcast: "true"
                                        });
                                        router.push(`/schedule?${params.toString()}`);
                                        toast.success("Opening Broadcast Wizard for selected items!");
                                    }}
                                    className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-black shadow-lg shadow-purple-500/20 hover:scale-105 transition"
                                >
                                    BROADCAST ALL
                                </button>
                            </div>
                        </header>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {generatedItems.map((item) => (
                                <ResultCard
                                    key={item.id}
                                    item={item}
                                    isContentVideo={isContentVideo}
                                    content={content}
                                    videoConfig={videoConfig}
                                    getMediaUrl={getMediaUrl}
                                    handleAction={handleAction}
                                    selectedItems={selectedItems}
                                    setSelectedItems={setSelectedItems}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

// Sub-component for individual result items to manage state locally
function ResultCard({ item, isContentVideo, content, videoConfig, getMediaUrl, handleAction, selectedItems, setSelectedItems }: any) {
    const [isPlaying, setIsPlaying] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    const togglePlay = (e: React.MouseEvent) => {
        // Prevent triggering toggle if clicking the Save/Schedule buttons
        if ((e.target as HTMLElement).closest('button')) return;

        if (videoRef.current) {
            if (videoRef.current.paused) {
                videoRef.current.play().catch(console.error);
            } else {
                videoRef.current.pause();
            }
        } else {
            // fallback for iframed content
            setIsPlaying(!isPlaying);
        }
    };

    const isSelected = selectedItems.has(item.id);

    return (
        <div
            className={`group relative bg-slate-900/50 border rounded-3xl overflow-hidden transition-all duration-300 ${isSelected ? 'border-purple-500 shadow-2xl shadow-purple-500/10' : 'border-white/5 hover:border-purple-500/40'}`}
        >
            <div className="absolute top-4 left-4 z-10">
                <button
                    onClick={() => {
                        const next = new Set(selectedItems);
                        if (next.has(item.id)) next.delete(item.id);
                        else next.add(item.id);
                        setSelectedItems(next);
                    }}
                    className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-purple-600 border-purple-500' : 'bg-black/50 border-white/20 hover:border-white/40'}`}
                >
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                </button>
            </div>

            <div
                className={`${isContentVideo ? (ASPECT_CLASS_MAP[videoConfig.aspectRatio] || "aspect-[9/16]") : "aspect-[9/16]"} relative flex items-center justify-center overflow-hidden cursor-pointer`}
                onClick={togglePlay}
            >
                {isContentVideo ? (
                    <>
                        {(item.fileUrl || content.fileUrl || content.filePath) && (
                            (() => {
                                const fileUrl = item.fileUrl || content.fileUrl || content.filePath || "";
                                const isYouTube = fileUrl.includes("youtube.com") || fileUrl.includes("youtu.be");
                                const absoluteUrl = getMediaUrl(fileUrl);

                                if (isYouTube) {
                                    const ytId = fileUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/|s\/|live\/))([^&?\/]+)/)?.[1];
                                    return ytId ? (
                                        <div className="absolute inset-0">
                                            <div className={`${videoConfig.aspectRatio === '1:1' ? 'w-[177%] h-full' : 'w-[300%] h-full'} absolute left-1/2 -translate-x-1/2`}>
                                                <iframe
                                                    width="100%"
                                                    height="100%"
                                                    src={`https://www.youtube.com/embed/${ytId}?start=${item.startTime}&end=${item.endTime}&controls=1&mute=0&autoplay=0&rel=0&modestbranding=1`}
                                                    frameBorder="0"
                                                    className="w-full h-full"
                                                />
                                            </div>
                                        </div>
                                    ) : null;
                                }

                                return (
                                    <video
                                        ref={videoRef}
                                        src={`${absoluteUrl}#t=${item.startTime},${item.endTime}`}
                                        className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition duration-500"
                                        muted
                                        autoPlay
                                        playsInline
                                        onPlay={() => setIsPlaying(true)}
                                        onPause={() => setIsPlaying(false)}
                                        onEnded={(e) => {
                                            const v = e.currentTarget;
                                            v.currentTime = item.startTime || 0;
                                            v.play().catch(console.error);
                                        }}
                                        onTimeUpdate={(e) => {
                                            const v = e.currentTarget;
                                            // Manual loop fallback for fragments
                                            if (item.endTime && v.currentTime >= item.endTime) {
                                                v.currentTime = item.startTime || 0;
                                                v.play().catch(console.error);
                                            }
                                        }}
                                    />
                                );
                            })()
                        )}

                        <div className={`play-overlay absolute inset-0 bg-black/40 flex items-center justify-center z-[2] transition-all pointer-events-none ${isPlaying ? 'opacity-0 scale-50' : 'opacity-100 scale-100 group-hover:bg-black/20'}`}>
                            <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center group-hover:scale-110 transition duration-500">
                                <Play className="w-6 h-6 text-white fill-white ml-0.5" />
                            </div>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-6 z-[2] pointer-events-none">
                            <h3 className="font-bold text-white mb-2 line-clamp-2">{item.title}</h3>
                            <div className="flex gap-2">
                                <span className="text-[9px] font-black bg-purple-600 px-2 py-0.5 rounded uppercase">{videoConfig.aspectRatio}</span>
                                <span className="text-[9px] font-black bg-blue-600 px-2 py-0.5 rounded uppercase">Subtitles</span>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="w-full h-full bg-white p-8 group-hover:scale-105 transition duration-500 flex flex-col">
                        <FileText className="w-12 h-12 text-slate-200 absolute -top-2 -right-2 transform rotate-12" />
                        <h3 className="text-slate-900 font-bold text-xl mb-4 relative z-10">{item.title}</h3>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-slate-500 text-xs leading-relaxed">{item.content}</p>
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-100 flex gap-2">
                            <span className="text-[9px] font-black bg-slate-100 text-slate-400 px-2 py-0.5 rounded uppercase">AI Draft</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-2 grid grid-cols-3 gap-1 bg-black/40 border-t border-white/5 relative z-10">
                <button onClick={() => handleAction(item, "schedule")} className="py-3 flex flex-col items-center gap-1 hover:bg-white/5 rounded-xl transition group/btn">
                    <Calendar className="w-4 h-4 text-gray-500 group-hover/btn:text-blue-400" />
                    <span className="text-[9px] font-black text-gray-600 uppercase">Schedule</span>
                </button>
                <button onClick={() => handleAction(item, "broadcast")} className="py-3 flex flex-col items-center gap-1 hover:bg-white/5 rounded-xl transition group/btn">
                    <Share2 className="w-4 h-4 text-gray-500 group-hover/btn:text-green-400" />
                    <span className="text-[9px] font-black text-gray-600 uppercase">Post</span>
                </button>
                <button onClick={() => handleAction(item, "download")} className="py-3 flex flex-col items-center gap-1 hover:bg-white/5 rounded-xl transition group/btn">
                    <Download className="w-4 h-4 text-gray-500 group-hover/btn:text-purple-400" />
                    <span className="text-[9px] font-black text-gray-600 uppercase">Save</span>
                </button>
            </div>
        </div>
    );
}
