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
    Layout
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

const DOC_STYLES = ["blog", "newsletter", "mail", "post"] as const;

type AspectRatio = typeof ASPECT_RATIOS[number]["id"];
type DocStyle = typeof DOC_STYLES[number];

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
    const { isAuthenticated } = useAuth();
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

    // Handle initialization safely
    useEffect(() => {
        setMounted(true);
    }, []);

    const isContentVideo = useMemo(() => {
        if (!content?.type) return false;
        const typeStr = String(content.type).toLowerCase();
        const urlStr = String(content.fileUrl || "").toLowerCase();
        return typeStr.includes("video") || typeStr === "youtube" || urlStr.includes("youtube.com") || urlStr.includes("youtu.be");
    }, [content]);

    useEffect(() => {
        if (mounted && !isAuthenticated) {
            router.push("/login");
        } else if (mounted && id) {
            loadContent();
        }
    }, [id, isAuthenticated, mounted]);

    const loadContent = async () => {
        if (!id) return;
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
                body = `[Video File Content Placeholder for Short #${i}]`;
            } else {
                const sentences = transcript.split(/[.!?]/).filter(s => s.trim().length > 15);
                const snippet = sentences.length > 3
                    ? sentences.slice(Math.min(i, sentences.length - 2), Math.min(i + 4, sentences.length)).join(". ")
                    : "This piece explores the primary themes of your document, focusing on actionable insights and clear takeaways for your audience.";

                body = `# ${hook}\n\n${snippet}\n\nThis content was automatically generated for your ${docConfig.style} using AI analysis of "${content.title}".\n\n**Key Highlights:**\n- Core insight from section ${i}\n- Optimized for ${docConfig.style} format\n- Viral hook integration\n\n#${docConfig.style} #repurposed`;
            }

            items.push({
                id: `gen-${i}`,
                title: isContentVideo
                    ? `Viral Short #${i}: ${hook}`
                    : `${docConfig.style.toUpperCase()} #${i}: ${hook}`,
                description: isContentVideo
                    ? "Optimized for retention with AI captions and dynamic cuts."
                    : (body.substring(0, 120) + "..."),
                type: isContentVideo ? "short" : "text",
                status: "ready",
                content: body
            });
        }
        setGeneratedItems(items);
        toast.success("Content generated successfully!");
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
                return prev + 5;
            });
        }, 100);
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
            toast.success(`${action} triggered for item`);
        }
    };

    const renderPreview = () => {
        if (!content) return null;

        const fileUrl = content.fileUrl || "";
        const isYouTube = fileUrl.includes("youtube.com") || fileUrl.includes("youtu.be");

        if (isContentVideo || isYouTube) {
            if (isYouTube) {
                // Fixed regex: removed double pipe typo
                const videoIdMatch = fileUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/|s\/)([^&?\/]+))/);
                const videoId = videoIdMatch?.[1];

                if (videoId) {
                    return (
                        <div className="w-full h-full min-h-[300px] bg-black rounded-xl overflow-hidden relative">
                            <iframe
                                width="100%"
                                height="100%"
                                src={`https://www.youtube.com/embed/${videoId}`}
                                title="YouTube video player"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="w-full h-full absolute inset-0"
                            />
                        </div>
                    );
                }
            }

            return (
                <div className="text-center">
                    <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                        <Play className="w-8 h-8 text-purple-400 ml-1" />
                    </div>
                    <p className="text-gray-400">Video Preview</p>
                    {fileUrl && !fileUrl.startsWith('http') && (
                        <p className="text-xs text-gray-500 mt-2">Local file: {fileUrl}</p>
                    )}
                </div>
            );
        }

        return (
            <div className="w-full h-full min-h-[400px] bg-white text-black p-8 rounded-xl shadow-2xl overflow-hidden relative flex flex-col">
                <div className="flex items-center gap-3 border-b-2 border-gray-100 pb-4 mb-4">
                    <FileText className="w-8 h-8 text-purple-600" />
                    <h3 className="font-bold text-xl">{content.title}</h3>
                </div>

                <div className="flex-1 overflow-auto max-h-[250px] mb-4 custom-scrollbar">
                    {content.analysis?.transcript ? (
                        <div className="text-sm text-gray-700 whitespace-pre-wrap font-serif leading-relaxed italic">
                            "{content.analysis.transcript.substring(0, 1000)}..."
                        </div>
                    ) : (
                        <div className="w-full space-y-3 opacity-30 mt-4">
                            {[0, 1, 2, 3, 4].map(i => <div key={i} className="h-2 bg-gray-300 rounded w-full" style={{ width: `${100 - (i * 5)}%` }} />)}
                            <p className="text-center text-[10px] text-gray-400 mt-2">No transcript available - AI will process on generation</p>
                        </div>
                    )}
                </div>

                <div className="mt-auto p-4 bg-purple-50 rounded-lg text-xs text-purple-900 border border-purple-100">
                    <p className="font-bold mb-1">Context / Description:</p>
                    <p className="line-clamp-2">{content.description || "No description provided. We'll use the document content."}</p>
                </div>

                <div className="absolute top-2 right-4 text-[10px] font-bold text-purple-200 uppercase">
                    Source Document
                </div>
            </div>
        );
    };

    // Prevent hydration issues by not rendering before mount
    if (!mounted) return null;

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
        <div className="min-h-screen bg-slate-950 text-white pb-20">
            {/* Header */}
            <nav className="bg-slate-900/50 backdrop-blur-lg border-b border-white/10 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link
                            href="/content"
                            className="flex items-center gap-2 text-gray-400 hover:text-white transition"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Back to Library
                        </Link>
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-8 h-8 text-purple-400" />
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-200">
                                RepurposeX
                            </span>
                        </div>
                        <div className="w-24" />
                    </div>
                </div>
            </nav>

            <main className="max-w-5xl mx-auto px-4 py-12">
                {/* Step: Configure */}
                {step === "configure" && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
                        <div className="text-center mb-10">
                            <h1 className="text-4xl font-bold mb-2">Configure Repurposing</h1>
                            <p className="text-gray-400">"{content.title}"</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 flex items-center justify-center min-h-[300px]">
                                {renderPreview()}
                            </div>

                            <div className="bg-slate-900/50 rounded-2xl p-8 border border-slate-800">
                                {isContentVideo ? (
                                    <div className="space-y-8">
                                        <div>
                                            <label className="flex items-center gap-2 text-lg font-bold mb-4 text-white">
                                                <Scissors className="w-5 h-5 text-purple-400" />
                                                Long to Shorts
                                            </label>
                                            <div className="grid grid-cols-3 gap-3">
                                                {[3, 6, 12].map(num => (
                                                    <button
                                                        key={num}
                                                        onClick={() => setVideoConfig(prev => ({ ...prev, numShorts: num as 3 | 6 | 12 }))}
                                                        className={`py-3 px-4 rounded-xl border font-bold transition ${videoConfig.numShorts === num
                                                            ? "bg-purple-600 border-purple-500 text-white"
                                                            : "bg-slate-950 border-slate-800 text-gray-400 hover:border-purple-500/50"
                                                            }`}
                                                    >
                                                        {num} Shorts
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="flex items-center gap-2 text-lg font-bold mb-4 text-white">
                                                <Layout className="w-5 h-5 text-pink-400" />
                                                Reframe Video
                                            </label>
                                            <div className="grid grid-cols-4 gap-3">
                                                {ASPECT_RATIOS.map(ratio => {
                                                    const Icon = ratio.icon;
                                                    return (
                                                        <button
                                                            key={ratio.id}
                                                            onClick={() => setVideoConfig(prev => ({ ...prev, aspectRatio: ratio.id }))}
                                                            className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl border transition ${videoConfig.aspectRatio === ratio.id
                                                                ? "bg-pink-600/20 border-pink-500 text-white"
                                                                : "bg-slate-950 border-slate-800 text-gray-400 hover:border-pink-500/50"
                                                                }`}
                                                        >
                                                            <Icon className="w-4 h-4" />
                                                            <span className="text-xs font-bold">{ratio.label}</span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                                                    <Type className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold">AI Captions</h4>
                                                    <p className="text-xs text-gray-500">Auto-generate subtitles</p>
                                                </div>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={videoConfig.aiCaptions}
                                                    onChange={(e) => setVideoConfig(prev => ({ ...prev, aiCaptions: e.target.checked }))}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                            </label>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-8">
                                        <div>
                                            <label className="flex items-center gap-2 text-lg font-bold mb-4 text-white">
                                                <Files className="w-5 h-5 text-pink-400" />
                                                Long to Content Pieces
                                            </label>
                                            <div className="grid grid-cols-4 gap-3">
                                                {[2, 4, 6, 8].map(num => (
                                                    <button
                                                        key={num}
                                                        onClick={() => setDocConfig(prev => ({ ...prev, numPieces: num as 2 | 4 | 6 | 8 }))}
                                                        className={`py-3 px-4 rounded-xl border font-bold transition ${docConfig.numPieces === num
                                                            ? "bg-pink-600 border-pink-500 text-white"
                                                            : "bg-slate-950 border-slate-800 text-gray-400 hover:border-pink-500/50"
                                                            }`}
                                                    >
                                                        {num}x
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="flex items-center gap-2 text-lg font-bold mb-4 text-white">
                                                <Wand2 className="w-5 h-5 text-purple-400" />
                                                Content Style
                                            </label>
                                            <div className="grid grid-cols-2 gap-3">
                                                {DOC_STYLES.map(style => (
                                                    <button
                                                        key={style}
                                                        onClick={() => setDocConfig(prev => ({ ...prev, style }))}
                                                        className={`py-3 px-4 rounded-xl border font-bold capitalize transition ${docConfig.style === style
                                                            ? "bg-purple-600/20 border-purple-500 text-white"
                                                            : "bg-slate-950 border-slate-800 text-gray-400 hover:border-purple-500/50"
                                                            }`}
                                                    >
                                                        {style}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-yellow-500/20 rounded-lg text-yellow-400">
                                                    <Sparkles className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold">AI Hooks & Enhance</h4>
                                                    <p className="text-xs text-gray-500">Add viral hooks instantly</p>
                                                </div>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={docConfig.aiHooks}
                                                    onChange={(e) => setDocConfig(prev => ({ ...prev, aiHooks: e.target.checked }))}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                                            </label>
                                        </div>
                                    </div>
                                )}

                                <button
                                    onClick={startProcessing}
                                    className="w-full mt-8 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-[length:200%_auto] hover:bg-right transition-all duration-500 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-purple-500/25 flex items-center justify-center gap-2"
                                >
                                    <Wand2 className="w-6 h-6" />
                                    Generate Magic
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step: Processing */}
                {step === "processing" && (
                    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center animate-in fade-in zoom-in duration-500">
                        <div className="relative w-32 h-32 mb-8">
                            <div className="absolute inset-0 border-4 border-slate-800 rounded-full" />
                            <div className="absolute inset-0 border-4 border-purple-500 rounded-full border-t-transparent animate-spin" />
                            <div className="absolute inset-0 flex items-center justify-center font-bold">
                                {processingProgress}%
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold mb-2">AI is working its magic...</h2>
                        <p className="text-gray-400 max-w-md mx-auto">Identifying viral moments and generating content.</p>
                    </div>
                )}

                {/* Step: Results */}
                {step === "results" && (
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                            <div>
                                <h2 className="text-3xl font-bold mb-1">Your Repurposed Content</h2>
                                <p className="text-gray-400">Generated {generatedItems.length} pieces from "{content.title}".</p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setStep("configure")}
                                    className="px-6 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg font-medium transition"
                                >
                                    Start Over
                                </button>
                                <button
                                    className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-lg hover:shadow-purple-500/25 text-white rounded-lg font-bold transition"
                                    onClick={() => toast.success("Broadcasting triggered!")}
                                >
                                    Broadcast All
                                </button>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {generatedItems.map((item) => (
                                <div
                                    key={item.id}
                                    className="relative bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden group transition-all duration-300 hover:border-purple-500/50"
                                >
                                    <div className="aspect-[9/16] bg-black relative flex items-center justify-center">
                                        {isContentVideo ? (
                                            <>
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-6">
                                                    <h3 className="font-bold text-white text-lg mb-1">{item.title}</h3>
                                                    <p className="text-xs text-gray-300 line-clamp-2">{item.description}</p>
                                                </div>
                                                <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                                                    <Play className="w-5 h-5 fill-white text-white ml-1" />
                                                </div>
                                            </>
                                        ) : (
                                            <div className="p-8 bg-white text-black h-full w-full flex flex-col relative overflow-hidden">
                                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                                    <FileText className="w-24 h-24" />
                                                </div>
                                                <h3 className="font-bold text-xl mb-4">{item.title}</h3>
                                                <p className="text-xs mb-4 text-gray-500">{item.description}</p>
                                                <div className="text-[10px] text-gray-500 line-clamp-6 whitespace-pre-wrap">{item.content}</div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-4 grid grid-cols-3 gap-2 bg-slate-900 border-t border-slate-800">
                                        <button onClick={() => handleAction(item, "schedule")} className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-slate-800 text-gray-400 hover:text-white transition">
                                            <Calendar className="w-4 h-4" />
                                            <span className="text-[10px] uppercase font-bold">Schedule</span>
                                        </button>
                                        <button onClick={() => handleAction(item, "broadcast")} className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-slate-800 text-gray-400 hover:text-white transition">
                                            <Share2 className="w-4 h-4" />
                                            <span className="text-[10px] uppercase font-bold">Post</span>
                                        </button>
                                        <button onClick={() => handleAction(item, "download")} className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-slate-800 text-gray-400 hover:text-white transition">
                                            <Download className="w-4 h-4" />
                                            <span className="text-[10px] uppercase font-bold">Download</span>
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
