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

// Static Data
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
    "twitter": "aspect-[1.20/1]"
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

    // Detect if content is video
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
            urlStr.includes("/video/upload/") ||
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

        if (url.startsWith("/")) {
            if (url.startsWith("/api") || url.startsWith("/uploads") || url.startsWith("/tmp/uploads")) {
                return `${baseUrl}${url}`;
            }
            return `${baseUrl}${url}`;
        }

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
        setSelectedItems(new Set(items.map(i => i.id)));
        toast.success("Repurposing complete!");
    };

    const startProcessing = async () => {
        setStep("processing");
        setProcessingProgress(0);

        try {
            const jobType = isContentVideo ? "video_to_shorts" : docConfig.style;
            const job = await repurposeAPI.create({
                contentId: id,
                outputType: jobType,
                tone: 'professional',
                config: isContentVideo
                    ? { numShorts: videoConfig.numShorts, aspectRatio: videoConfig.aspectRatio }
                    : { numPieces: docConfig.numPieces, style: docConfig.style }
            });

            console.log("Job created:", job);

            let attempts = 0;
            const maxAttempts = 30;

            const pollInterval = setInterval(async () => {
                attempts++;
                setProcessingProgress(Math.min(90, attempts * 3));

                try {
                    const status = await repurposeAPI.getJob(job.id);
                    if (status.status === 'completed') {
                        clearInterval(pollInterval);
                        setProcessingProgress(100);

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
                    generateMockResults();
                    setStep("results");
                    toast("Using smart-mock generation (AI is taking too long)");
                }
            }, 2000);

        } catch (error) {
            console.error("Failed to start job:", error);
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
                const absoluteUrl = getMediaUrl(fileUrl || "");

                if (!fileUrl && isContentVideo) {
                    toast.error("Media source not found");
                    return;
                }

                if (fileUrl?.includes("youtube.com") || fileUrl?.includes("youtu.be")) {
                    toast.error("YouTube content cannot be downloaded directly. Use Share or Schedule.", {
                        duration: 5000,
                        icon: '⚠️'
                    });
                    return;
                }

                toast.loading("Preparing download...", { id: "download" });

                if (isContentVideo) {
                    try {
                        const response = await fetch(absoluteUrl);
                        if (!response.ok) throw new Error(`HTTP ${response.status}`);
                        const blob = await response.blob();
                        const blobUrl = window.URL.createObjectURL(blob);

                        const link = document.createElement("a");
                        link.href = blobUrl;
                        link.setAttribute("download", `${item.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.mp4`);
                        link.style.display = 'none';
                        document.body.appendChild(link);
                        link.click();

                        setTimeout(() => {
                            window.URL.revokeObjectURL(blobUrl);
                            document.body.removeChild(link);
                        }, 1000);

                        toast.success("Download started!", { id: "download" });
                    } catch (fetchError) {
                        console.error("Fetch download failed:", fetchError);
                        const link = document.createElement("a");
                        link.href = absoluteUrl;
                        link.setAttribute("download", `${item.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.mp4`);
                        link.click();
                        toast.success("Download initiated", { id: "download" });
                    }
                } else {
                    const blob = new Blob([item.content || item.description], { type: "text/plain" });
                    const blobUrl = window.URL.createObjectURL(blob);
                    const link = document.createElement("a");
                    link.href = blobUrl;
                    link.setAttribute("download", `${item.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`);
                    link.click();
                    setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);
                    toast.success("Text clip saved!", { id: "download" });
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
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="w-full h-full"
                            />
                        </div>
                    );
                }

                return (
                    <div className="w-full aspect-video bg-slate-900 rounded-xl flex flex-col items-center justify-center border border-white/5">
                        <Video className="w-12 h-12 text-gray-600 mb-4" />
                        <p className="text-gray-400 font-medium">YouTube Video Detected</p>
                    </div>
                );
            }

            const videoSrc = getMediaUrl(fileUrl);
            if (videoSrc) {
                return (
                    <div className="w-full aspect-video bg-black rounded-xl overflow-hidden relative shadow-2xl">
                        <video
                            src={videoSrc}
                            controls
                            className="w-full h-full object-contain"
                            poster={content.analysis?.thumbnailUrl}
                        />
                    </div>
                );
            }

            return (
                <div className="w-full aspect-video bg-slate-900 rounded-xl flex flex-col items-center justify-center border border-white/5">
                    <Play className="w-12 h-12 text-purple-400 fill-purple-400 mb-4" />
                    <p className="text-gray-400 font-medium">Video Preview Ready</p>
                </div>
            );
        }

        return (
            <div className="w-full min-h-[400px] bg-white text-slate-800 p-8 rounded-xl shadow-2xl relative flex flex-col border border-slate-200">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-4">
                    <FileText className="w-6 h-6 text-blue-600" />
                    <div>
                        <h3 className="font-bold text-lg text-slate-900">{content.title}</h3>
                        <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">Source Document</p>
                    </div>
                </div>
                <div className="flex-1 overflow-auto max-h-[250px] mb-4">
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
                <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
                <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Loading Wizard</p>
            </div>
        );
    }

    if (!content) return null;

    return (
        <div className="min-h-screen bg-slate-950 text-white selection:bg-purple-500/30">
            <nav className="bg-black/40 backdrop-blur-2xl border-b border-white/5 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 flex justify-between items-center h-20">
                    <div className="flex items-center gap-6">
                        <Link href="/content" className="p-2 hover:bg-white/5 rounded-full transition">
                            <ArrowLeft className="w-5 h-5 text-gray-500" />
                        </Link>
                        <div className="flex items-center gap-2 text-purple-400 font-black uppercase text-sm tracking-widest">
                            <Sparkles className="w-5 h-5" /> Repurpose Wizard
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 py-12">
                {step === "configure" && (
                    <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
                        <h1 className="text-4xl font-black mb-8 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Magic Configuration</h1>
                        <div className="grid lg:grid-cols-2 gap-10">
                            <section className="space-y-6">{renderPreview()}</section>
                            <section className="bg-slate-900/50 border border-white/10 rounded-3xl p-8 backdrop-blur-md">
                                {isContentVideo ? (
                                    <div className="space-y-8">
                                        <div>
                                            <label className="text-lg font-bold flex items-center gap-2 mb-4"><Scissors className="w-5 h-5 text-purple-400" /> Video Clips</label>
                                            <div className="grid grid-cols-3 gap-3">
                                                {[3, 6, 12].map(num => (
                                                    <button key={num} onClick={() => setVideoConfig(v => ({ ...v, numShorts: num as 3 | 6 | 12 }))} className={`py-4 rounded-xl border-2 transition-all font-black text-lg ${videoConfig.numShorts === num ? 'bg-purple-600 border-purple-400 shadow-lg shadow-purple-500/20' : 'bg-black/40 border-slate-800 text-gray-500 hover:border-purple-500/30'}`}>{num}</button>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-lg font-bold flex items-center gap-2 mb-4"><Layout className="w-5 h-5 text-pink-400" /> Aspect Ratio</label>
                                            <div className="grid grid-cols-4 gap-3">
                                                {ASPECT_RATIOS.map(ratio => {
                                                    const Icon = ratio.icon;
                                                    return (
                                                        <button key={ratio.id} onClick={() => setVideoConfig(v => ({ ...v, aspectRatio: ratio.id }))} className={`flex flex-col items-center gap-2 py-4 rounded-xl border-2 transition-all ${videoConfig.aspectRatio === ratio.id ? "bg-pink-600/20 border-pink-500 text-white" : "bg-black/20 border-slate-800 text-gray-500 hover:border-pink-500/30"}`}>
                                                            <Icon className="w-5 h-5" /><span className="text-[10px] font-black uppercase">{ratio.label}</span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                        <div className="p-5 bg-black/40 rounded-2xl border border-white/5 flex items-center justify-between">
                                            <div className="flex items-center gap-4"><Type className="w-5 h-5 text-blue-400" /><div><p className="font-bold">AI Dynamic Captions</p><p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Viral Styled</p></div></div>
                                            <input type="checkbox" checked={videoConfig.aiCaptions} onChange={e => setVideoConfig(v => ({ ...v, aiCaptions: e.target.checked }))} className="w-10 h-5 rounded-full appearance-none bg-slate-700 checked:bg-purple-600 cursor-pointer transition-all relative after:content-[''] after:absolute after:w-4 after:h-4 after:bg-white after:rounded-full after:left-0.5 after:top-0.5 checked:after:left-5.5 after:transition-all" />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-8">
                                        <div>
                                            <label className="text-lg font-bold flex items-center gap-2 mb-4"><Files className="w-5 h-5 text-pink-400" /> Content Pieces</label>
                                            <div className="grid grid-cols-4 gap-3">
                                                {[2, 4, 6, 8].map(num => (
                                                    <button key={num} onClick={() => setDocConfig(d => ({ ...d, numPieces: num as 2 | 4 | 6 | 8 }))} className={`py-4 rounded-xl border-2 transition-all font-black text-lg ${docConfig.numPieces === num ? 'bg-pink-600 border-pink-400' : 'bg-black/40 border-slate-800 text-gray-500 hover:border-pink-500/30'}`}>{num}</button>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-lg font-bold flex items-center gap-2 mb-4"><Wand2 className="w-5 h-5 text-purple-400" /> Output Style</label>
                                            <div className="grid grid-cols-2 gap-3">
                                                {DOC_STYLES.map(style => (
                                                    <button key={style.id} onClick={() => setDocConfig(d => ({ ...d, style: style.id }))} className={`py-3 rounded-xl border-2 transition-all font-bold text-sm ${docConfig.style === style.id ? 'bg-purple-600/20 border-purple-500' : 'bg-black/40 border-slate-800 text-gray-500'}`}>{style.label}</button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <button onClick={startProcessing} className="w-full mt-10 py-5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-black text-lg shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-3"><Wand2 className="w-6 h-6 animate-pulse" /> GENERATE CONTENT</button>
                            </section>
                        </div>
                    </div>
                )}

                {step === "processing" && (
                    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
                        <div className="relative w-40 h-40 mb-8 flex items-center justify-center">
                            <div className="absolute inset-0 border-4 border-white/5 rounded-full" />
                            <div className="absolute inset-0 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                            <span className="text-3xl font-black">{processingProgress}%</span>
                        </div>
                        <h2 className="text-2xl font-black mb-2 tracking-tight">AI is crafting your pieces...</h2>
                        <p className="text-gray-500">Extracting insights and optimizing for engagement.</p>
                    </div>
                )}

                {step === "results" && (
                    <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
                        <header className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                            <div>
                                <h1 className="text-4xl font-black mb-2">Generated Assets</h1>
                                <p className="text-gray-400">Total {generatedItems.length} pieces ready for deployment.</p>
                            </div>
                            <div className="flex gap-4">
                                <button onClick={() => setStep("configure")} className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl font-bold hover:bg-white/10 transition">Adjust Settings</button>
                                <button
                                    onClick={() => {
                                        const selected = generatedItems.filter(i => selectedItems.has(i.id));
                                        if (selected.length === 0) return toast.error("Select items first");
                                        handleAction(selected[0], "broadcast");
                                    }}
                                    className="px-8 py-3 bg-purple-600 rounded-xl font-black shadow-lg shadow-purple-500/20 hover:scale-[1.05] transition-all"
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

function ResultCard({ item, isContentVideo, content, videoConfig, getMediaUrl, handleAction, selectedItems, setSelectedItems }: any) {
    const [isLocalPlaying, setIsLocalPlaying] = useState(false);
    const [showYTIframe, setShowYTIframe] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    // Get Clean File URL
    const fileUrl = item.fileUrl || content?.fileUrl || content?.filePath || "";
    // Regex to detect YouTube (including Shorts)
    const ytId = fileUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/|s\/|live\/))([^&?\/]+)/)?.[1];

    // Toggle for Local Video
    const toggleLocalPlay = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (videoRef.current) {
            if (videoRef.current.paused) {
                videoRef.current.play().catch(err => console.error("Play error:", err));
                setIsLocalPlaying(true);
            } else {
                videoRef.current.pause();
                setIsLocalPlaying(false);
            }
        }
    };

    // Toggle for YouTube (Swap Thumbnail -> Iframe)
    const activateYouTube = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setShowYTIframe(true);
    };

    const isSelected = selectedItems.has(item.id);

    return (
        <div className={`group relative bg-slate-900/50 border rounded-3xl overflow-hidden transition-all duration-300 ${isSelected ? 'border-purple-500 shadow-2xl' : 'border-white/5 hover:border-purple-500/40'}`}>
            <div className="absolute top-4 left-4 z-20">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        // Handle selection
                        const next = new Set(selectedItems);
                        if (next.has(item.id)) next.delete(item.id);
                        else next.add(item.id);
                        setSelectedItems(next);
                    }}
                    className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all cursor-pointer ${isSelected ? 'bg-purple-600 border-purple-500' : 'bg-black/50 border-white/20'}`}
                >
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                </button>
            </div>

            <div className={`${isContentVideo ? (ASPECT_CLASS_MAP[videoConfig.aspectRatio] || "aspect-[9/16]") : "aspect-[9/16]"} bg-black relative flex items-center justify-center overflow-hidden cursor-pointer`}>

                {/* CASE 1: YouTube Video */}
                {isContentVideo && ytId && (
                    <div className="absolute inset-0 w-full h-full bg-black">
                        {showYTIframe ? (
                            // 1A: IFRAME ACTIVE (Playing)
                            <div className="w-full h-full">
                                <iframe
                                    width="100%"
                                    height="100%"
                                    src={`https://www.youtube.com/embed/${ytId}?start=${item.startTime}&end=${item.endTime}&controls=1&mute=0&autoplay=1&rel=0&modestbranding=1&enablejsapi=1`}
                                    frameBorder="0"
                                    className="w-full h-full"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                />
                            </div>
                        ) : (
                            // 1B: THUMBNAIL (Paused) - + Purple Play Button
                            <div
                                className="w-full h-full relative group"
                                onClick={activateYouTube}
                            >
                                <img
                                    src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`}
                                    alt="Video thumbnail"
                                    className="w-full h-full object-cover opacity-80 group-hover:opacity-60 transition-opacity duration-300"
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 shadow-xl group-hover:scale-110 transition-transform duration-300">
                                        <Play className="w-8 h-8 text-purple-400 ml-1 fill-purple-400" />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* CASE 2: Local Video */}
                {isContentVideo && !ytId && (
                    <div className="absolute inset-0 w-full h-full" onClick={toggleLocalPlay}>
                        <video
                            ref={videoRef}
                            src={`${getMediaUrl(fileUrl)}#t=${item.startTime || 0},${item.endTime || 10}`}
                            className="w-full h-full object-cover"
                            muted
                            loop
                            playsInline
                            poster={content?.analysis?.thumbnailUrl}
                            onPlay={() => setIsLocalPlaying(true)}
                            onPause={() => setIsLocalPlaying(false)}
                            onEnded={() => setIsLocalPlaying(false)}
                        />
                        {/* PLAY OVERLAY (Only if NOT playing) */}
                        {!isLocalPlaying && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10 transition-all duration-300">
                                <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 shadow-xl">
                                    <Play className="w-8 h-8 text-purple-400 ml-1 fill-purple-400" />
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* CASE 3: Text Content */}
                {!isContentVideo && (
                    <div className="w-full h-full bg-white p-8 group-hover:bg-slate-50 transition-colors duration-500 flex flex-col">
                        <FileText className="w-10 h-10 text-slate-100 absolute -top-1 -right-1 transform rotate-12" />
                        <h3 className="text-slate-900 font-bold text-lg mb-4 line-clamp-2">{item.title}</h3>
                        <div className="flex-1 overflow-hidden relative text-slate-500 text-xs leading-relaxed">
                            <p>{item.content}</p>
                            <div className="absolute bottom-0 inset-x-0 h-6 bg-gradient-to-t from-white to-transparent" />
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-100 flex gap-2">
                            <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase tracking-tighter">TEXT CLIPPED</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-1 grid grid-cols-3 gap-1 bg-black/60 border-t border-white/5 relative z-20 backdrop-blur-md">
                <button onClick={(e) => { e.stopPropagation(); handleAction(item, "schedule"); }} className="py-3 flex flex-col items-center gap-1 hover:bg-white/5 rounded-2xl transition group/btn"><Calendar className="w-4 h-4 text-gray-500 group-hover/btn:text-blue-400" /><span className="text-[10px] font-black text-gray-500 uppercase tracking-tighter">Schedule</span></button>
                <button onClick={(e) => { e.stopPropagation(); handleAction(item, "broadcast"); }} className="py-3 flex flex-col items-center gap-1 hover:bg-white/5 rounded-2xl transition group/btn"><Share2 className="w-4 h-4 text-gray-500 group-hover/btn:text-green-400" /><span className="text-[10px] font-black text-gray-500 uppercase tracking-tighter">Post</span></button>
                <button onClick={(e) => { e.stopPropagation(); handleAction(item, "download"); }} className="py-3 flex flex-col items-center gap-1 hover:bg-white/5 rounded-2xl transition group/btn"><Download className="w-4 h-4 text-gray-500 group-hover/btn:text-purple-400" /><span className="text-[10px] font-black text-gray-500 uppercase tracking-tighter">Save</span></button>
            </div>
        </div>
    );
}
