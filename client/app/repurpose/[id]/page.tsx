"use client";

import { useState, useEffect, useMemo } from "react";
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
    CheckCircle2
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { contentAPI } from "@/lib/api";
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

type AspectRatio = typeof ASPECT_RATIOS[number]["id"];
type DocStyle = typeof DOC_STYLES[number]["id"];

interface GeneratedItem {
    id: string;
    title: string;
    description: string;
    type: "short" | "text";
    status: "ready" | "scheduled" | "published";
    content?: string;
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

        return (
            typeStr.includes("video") ||
            typeStr === "youtube" ||
            urlStr.includes("youtube.com") ||
            urlStr.includes("youtu.be") ||
            urlStr.endsWith(".mp4") ||
            urlStr.endsWith(".mov") ||
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
                content: body
            });
        }
        setGeneratedItems(items);
        setSelectedItems(new Set(items.map(i => i.id))); // Select all by default
        toast.success("Repurposing complete!");
    };

    const startProcessing = () => {
        setStep("processing");
        setProcessingProgress(0);

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
    };

    const handleAction = (item: GeneratedItem, action: string) => {
        if (action === "download" && item.content) {
            const blob = new Blob([item.content], { type: "text/plain" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${item.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            toast.success("Download started");
        } else {
            toast.success(`${action.charAt(0).toUpperCase() + action.slice(1)} triggered!`);
        }
    };

    const renderPreview = () => {
        if (!content) return null;

        const fileUrl = content.fileUrl || "";
        const isYouTube = fileUrl.includes("youtube.com") || fileUrl.includes("youtu.be");

        if (isContentVideo || isYouTube) {
            if (isYouTube) {
                const videoIdMatch = fileUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/|s\/)([^&?\/]+))/);
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
            }

            // Real video tag for direct uploads
            if (fileUrl && (fileUrl.startsWith("http") || fileUrl.startsWith("/api") || fileUrl.startsWith("blob:"))) {
                return (
                    <div className="w-full aspect-video bg-black rounded-xl overflow-hidden relative shadow-2xl">
                        <video
                            src={fileUrl}
                            controls
                            className="w-full h-full object-contain"
                            poster={content.analysis?.thumbnailUrl}
                        />
                    </div>
                );
            }

            // Placeholder with better UI
            return (
                <div className="w-full aspect-video bg-slate-900 rounded-xl flex flex-col items-center justify-center border border-slate-800">
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

                <div className="mt-auto p-4 bg-slate-50 rounded-lg border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 mb-1">DESCRIPTION</p>
                    <p className="text-sm text-slate-700 line-clamp-2">{content.description || "No description provided."}</p>
                </div>
            </div>
        );
    };

    if (!mounted) return null;

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
                <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-4" />
                <p className="text-gray-400 animate-pulse">Loading Magic...</p>
            </div>
        );
    }

    if (!content) return null;

    return (
        <div className="min-h-screen bg-slate-950 text-white font-outfit pb-20">
            {/* Nav */}
            <nav className="bg-slate-900/50 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
                    <Link href="/content" className="flex items-center gap-2 text-gray-400 hover:text-white transition">
                        <ArrowLeft className="w-4 h-4" />
                        <span>Library</span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-xl tracking-tight">RepurposeX</span>
                    </div>
                    <div className="w-20" />
                </div>
            </nav>

            <main className="max-w-6xl mx-auto px-4 py-10">
                {step === "configure" && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <header className="text-center mb-12">
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
                                    onClick={() => toast.success("Broadcast initiated for selected items!")}
                                    className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-black shadow-lg shadow-purple-500/20 hover:scale-105 transition"
                                >
                                    BROADCAST ALL
                                </button>
                            </div>
                        </header>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {generatedItems.map((item) => (
                                <div
                                    key={item.id}
                                    className={`group relative bg-slate-900/50 border rounded-3xl overflow-hidden transition-all duration-300 ${selectedItems.has(item.id) ? 'border-purple-500 shadow-2xl shadow-purple-500/10' : 'border-white/5 hover:border-purple-500/40'}`}
                                >
                                    <div className="absolute top-4 left-4 z-10">
                                        <button
                                            onClick={() => {
                                                const next = new Set(selectedItems);
                                                if (next.has(item.id)) next.delete(item.id);
                                                else next.add(item.id);
                                                setSelectedItems(next);
                                            }}
                                            className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${selectedItems.has(item.id) ? 'bg-purple-600 border-purple-500' : 'bg-black/50 border-white/20 hover:border-white/40'}`}
                                        >
                                            {selectedItems.has(item.id) && <CheckCircle2 className="w-4 h-4 text-white" />}
                                        </button>
                                    </div>

                                    <div className="aspect-[9/16] relative flex items-center justify-center overflow-hidden">
                                        {isContentVideo ? (
                                            <>
                                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent z-[1]" />
                                                <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center z-[2] group-hover:scale-110 transition duration-500">
                                                    <Play className="w-6 h-6 text-white fill-white ml-0.5" />
                                                </div>
                                                <div className="absolute bottom-0 left-0 right-0 p-6 z-[2]">
                                                    <h3 className="font-bold text-white mb-2 line-clamp-2">{item.title}</h3>
                                                    <div className="flex gap-2">
                                                        <span className="text-[9px] font-black bg-purple-600 px-2 py-0.5 rounded uppercase">9:16</span>
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

                                    <div className="p-2 grid grid-cols-3 gap-1 bg-black/40 border-t border-white/5">
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
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
