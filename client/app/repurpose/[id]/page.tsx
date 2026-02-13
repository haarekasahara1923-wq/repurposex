"use client";

import { useState, useEffect } from "react";
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
    Grid2X2,
    Smartphone,
    Twitter,
    FileText
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { contentAPI, ContentAsset } from "@/lib/api";
import toast from "react-hot-toast";

// Mock Data Types
type AspectRatio = "9:16" | "1:1" | "16:9" | "twitter";
type DocStyle = "blog" | "newsletter" | "mail" | "post";

interface GeneratedItem {
    id: string;
    title: string;
    description: string;
    type: "short" | "text";
    status: "ready" | "scheduled" | "published";
    content?: string; // Content body for download
}

const generateHook = () => {
    const hooks = [
        "The Secret Truth About...",
        "Stop Doing This Immediately!",
        "How I Gained 10k Followers...",
        "This Will Change Your Life...",
        "Unpopular Opinion: AI is..."
    ];
    return hooks[Math.floor(Math.random() * hooks.length)];
};

export default function RepurposePage() {
    const router = useRouter();
    const params = useParams();
    const { isAuthenticated } = useAuth();
    const id = params.id as string;

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

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (isAuthenticated) {
            loadContent();
        }
    }, [id, isAuthenticated]);

    if (!mounted) return null;

    if (!isAuthenticated) {
        router.push("/login");
        return null;
    }

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

    const isVideo = content?.type?.includes("video") || content?.type === "mp4" || content?.type === "mov" || content?.type === "youtube";

    const generateMockResults = () => {
        const items: GeneratedItem[] = [];
        const count = isVideo ? videoConfig.numShorts : docConfig.numPieces;
        const transcript = content?.analysis?.transcript || "";

        for (let i = 1; i <= count; i++) {
            const hook = generateHook();
            let body = "";

            if (isVideo) {
                body = `[Video File Content Placeholder for Short #${i}]`;
            } else {
                // Try to extract some snippets from transcript for more realism
                const sentences = transcript.split(/[.!?]/).filter(s => s.trim().length > 15);
                const snippet = sentences.length > 3
                    ? sentences.slice(Math.min(i, sentences.length - 2), Math.min(i + 4, sentences.length)).join(". ")
                    : "This piece explores the primary themes of your document, focusing on actionable insights and clear takeaways for your audience.";

                body = `# ${hook}\n\n${snippet}\n\nThis content was automatically generated for your ${docConfig.style} using AI analysis of "${content?.title}".\n\n**Key Highlights:**\n- Core insight from section ${i}\n- Optimized for ${docConfig.style} format\n- Viral hook integration\n\n#${docConfig.style} #repurposed`;
            }

            items.push({
                id: `gen-${i}`,
                title: isVideo
                    ? `Viral Short #${i}: ${hook}`
                    : `${docConfig.style.toUpperCase()} #${i}: ${hook}`,
                description: isVideo
                    ? "Optimized for retention with AI captions and dynamic cuts."
                    : (body.substring(0, 120) + "..."),
                type: isVideo ? "short" : "text",
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

    const handleDownload = (item: GeneratedItem) => {
        if (!item.content) {
            toast.error("No content to download");
            return;
        }

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
    };

    const handleAction = (item: GeneratedItem, action: string) => {
        if (action === "download") {
            handleDownload(item);
        } else {
            toast.success(`${action} triggered for item`);
        }
    };

    const renderPreview = () => {
        if (!content) return null;

        if (isVideo) {
            // Robust check for YouTube URLs
            const fileUrl = content.fileUrl || "";
            const isYouTube = fileUrl.includes("youtube.com") || fileUrl.includes("youtu.be");

            if (isYouTube) {
                // Extract video ID (handling various formats: watch?v=, embed/, v/, shorts/, youtu.be/)
                const videoIdMatch = fileUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/|)([^&?\/]+))/);
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
                            <div className="h-2 bg-gray-300 rounded w-full" />
                            <div className="h-2 bg-gray-300 rounded w-5/6" />
                            <div className="h-2 bg-gray-300 rounded w-full" />
                            <div className="h-2 bg-gray-300 rounded w-4/5" />
                            <div className="h-2 bg-gray-300 rounded w-full" />
                            <p className="text-center text-[10px] text-gray-400 mt-2">No transcript available - AI will process on generation</p>
                        </div>
                    )}
                </div>

                <div className="mt-auto p-4 bg-purple-50 rounded-lg text-xs text-purple-900 border border-purple-100">
                    <p className="font-bold mb-1">Context / Description:</p>
                    <p className="line-clamp-2">{content.description || "No description provided. We'll use the document content."}</p>
                </div>

                <div className="absolute top-2 right-4 text-[10px] font-bold text-purple-200">
                    SOURCE DOCUMENT
                </div>
            </div>
        );
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
        <div className="min-h-screen bg-slate-950 text-white pb-20">
            {/* Header */}
            <nav className="bg-slate-900/50 backdrop-blur-lg border-b border-white/10 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link
                            href={`/content`}
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
                            {/* Left: Input Preview */}
                            <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 flex items-center justify-center min-h-[300px]">
                                {renderPreview()}
                            </div>

                            {/* Right: Settings */}
                            <div className="bg-slate-900/50 rounded-2xl p-8 border border-slate-800">
                                {isVideo ? (
                                    <div className="space-y-8">
                                        {/* Long to Shorts */}
                                        <div>
                                            <label className="flex items-center gap-2 text-lg font-bold mb-4 text-white">
                                                <Scissors className="w-5 h-5 text-purple-400" />
                                                Long to Shorts
                                            </label>
                                            <div className="grid grid-cols-3 gap-3">
                                                {[3, 6, 12].map(num => (
                                                    <button
                                                        key={num}
                                                        onClick={() => setVideoConfig({ ...videoConfig, numShorts: num as 3 | 6 | 12 })}
                                                        className={`py-3 px-4 rounded-xl border font-bold transition ${videoConfig.numShorts === num
                                                            ? "bg-purple-600 border-purple-500 text-white"
                                                            : "bg-slate-950 border-slate-800 text-gray-400 hover:border-purple-500/50"
                                                            }`}
                                                    >
                                                        {num} Shorts
                                                    </button>
                                                ))}
                                            </div>
                                            <p className="text-xs text-gray-500 mt-2">
                                                AI will identify viral hooks and generate {videoConfig.numShorts} distinct clips.
                                            </p>
                                        </div>

                                        {/* Reframing */}
                                        <div>
                                            <label className="flex items-center gap-2 text-lg font-bold mb-4 text-white">
                                                <Grid2X2 className="w-5 h-5 text-pink-400" />
                                                Reframe Video
                                            </label>
                                            <div className="grid grid-cols-4 gap-3">
                                                {[
                                                    { id: "9:16", label: "9:16", icon: Smartphone },
                                                    { id: "1:1", label: "1:1", icon: Grid2X2 },
                                                    { id: "16:9", label: "16:9", icon: MonitorPlay },
                                                    { id: "twitter", label: "X", icon: Twitter },
                                                ].map(ratio => (
                                                    <button
                                                        key={ratio.id}
                                                        onClick={() => setVideoConfig({ ...videoConfig, aspectRatio: ratio.id as AspectRatio })}
                                                        className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl border transition ${videoConfig.aspectRatio === ratio.id
                                                            ? "bg-pink-600/20 border-pink-500 text-white"
                                                            : "bg-slate-950 border-slate-800 text-gray-400 hover:border-pink-500/50"
                                                            }`}
                                                    >
                                                        <ratio.icon className="w-4 h-4" />
                                                        <span className="text-xs font-bold">{ratio.label}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* AI Features */}
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
                                                    onChange={(e) => setVideoConfig({ ...videoConfig, aiCaptions: e.target.checked })}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                            </label>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-8">
                                        {/* Long to Short Text */}
                                        <div>
                                            <label className="flex items-center gap-2 text-lg font-bold mb-4 text-white">
                                                <FileText className="w-5 h-5 text-pink-400" />
                                                Long to Content Pieces
                                            </label>
                                            <div className="grid grid-cols-4 gap-3">
                                                {[2, 4, 6, 8].map(num => (
                                                    <button
                                                        key={num}
                                                        onClick={() => setDocConfig({ ...docConfig, numPieces: num as 2 | 4 | 6 | 8 })}
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

                                        {/* Style Selection */}
                                        <div>
                                            <label className="flex items-center gap-2 text-lg font-bold mb-4 text-white">
                                                <Wand2 className="w-5 h-5 text-purple-400" />
                                                Content Style
                                            </label>
                                            <div className="grid grid-cols-2 gap-3">
                                                {["blog", "newsletter", "mail", "post"].map(style => (
                                                    <button
                                                        key={style}
                                                        onClick={() => setDocConfig({ ...docConfig, style: style as DocStyle })}
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

                                        {/* AI Features */}
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
                                                    onChange={(e) => setDocConfig({ ...docConfig, aiHooks: e.target.checked })}
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
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-2xl font-bold">{processingProgress}%</span>
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold mb-2">AI is working its magic...</h2>
                        <p className="text-gray-400 max-w-md mx-auto">
                            Identifying viral moments, reframing content, and generating captions.
                        </p>
                    </div>
                )}

                {/* Step: Results */}
                {step === "results" && (
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                            <div>
                                <h2 className="text-3xl font-bold mb-1">Your Repurposed Content</h2>
                                <p className="text-gray-400">
                                    Generated {generatedItems.length} {isVideo ? "Shorts" : "Pieces"} from "{content.title}".
                                </p>
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
                                    onClick={() => toast.success(`Broadcasting ${generatedItems.filter(i => selectedItems.has(i.id)).length} items!`)}
                                >
                                    Broadcast Selected
                                </button>
                            </div>
                        </div>

                        {/* Bulk Selection Toggle */}
                        <div className="flex items-center gap-2 mb-4">
                            <input
                                type="checkbox"
                                id="selectAll"
                                checked={generatedItems.length > 0 && selectedItems.size === generatedItems.length}
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        setSelectedItems(new Set(generatedItems.map(i => i.id)));
                                    } else {
                                        setSelectedItems(new Set());
                                    }
                                }}
                                className="w-5 h-5 rounded border-gray-600 bg-slate-800 text-purple-600 focus:ring-purple-500"
                            />
                            <label htmlFor="selectAll" className="text-sm font-medium text-gray-300 cursor-pointer select-none">
                                Select All {isVideo ? "Shorts" : "Pieces"}
                            </label>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {generatedItems.map((item) => (
                                <div
                                    key={item.id}
                                    className={`relative bg-slate-900 border rounded-2xl overflow-hidden group transition-all duration-300 ${selectedItems.has(item.id)
                                        ? "border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.15)]"
                                        : "border-slate-800 hover:border-purple-500/50"
                                        }`}
                                >
                                    {/* Selection Checkbox */}
                                    <div className="absolute top-3 left-3 z-10">
                                        <input
                                            type="checkbox"
                                            checked={selectedItems.has(item.id)}
                                            onChange={(e) => {
                                                const newSet = new Set(selectedItems);
                                                if (e.target.checked) newSet.add(item.id);
                                                else newSet.delete(item.id);
                                                setSelectedItems(newSet);
                                            }}
                                            className="w-5 h-5 rounded border-white/20 bg-black/50 backdrop-blur text-purple-600 focus:ring-purple-500"
                                        />
                                    </div>

                                    {/* Preview Area */}
                                    <div className="aspect-[9/16] bg-black relative flex items-center justify-center">
                                        {isVideo ? (
                                            <>
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-6">
                                                    <h3 className="font-bold text-white text-lg mb-1 leading-tight">{item.title}</h3>
                                                    <p className="text-xs text-gray-300 line-clamp-2">{item.description}</p>
                                                </div>
                                                <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center cursor-pointer hover:bg-white/30 transition shadow-lg">
                                                    <Play className="w-5 h-5 fill-white text-white ml-1" />
                                                </div>
                                                {/* Badges */}
                                                <div className="absolute top-4 right-4 bg-purple-600 text-white text-[10px] font-bold px-2 py-1 rounded uppercase shadow-lg">
                                                    AI Captions
                                                </div>
                                            </>
                                        ) : (
                                            <div className="p-8 bg-white text-black h-full w-full flex flex-col relative overflow-hidden">
                                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                                    <FileText className="w-24 h-24" />
                                                </div>
                                                <h3 className="font-bold text-xl mb-4 relative z-10">{item.title}</h3>
                                                <p className="text-xs mb-4 text-gray-500">{item.description}</p>

                                                {/* Mock Body Preview using content snippet */}
                                                <div className="text-[10px] text-gray-500 line-clamp-6 whitespace-pre-wrap">
                                                    {item.content || "Content preview unavailable..."}
                                                </div>

                                                <div className="mt-auto pt-4 border-t border-gray-100 flex gap-2">
                                                    <span className="text-[10px] font-bold bg-gray-100 px-2 py-1 rounded">BLOG</span>
                                                    <span className="text-[10px] font-bold bg-gray-100 px-2 py-1 rounded">SEO</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="p-4 grid grid-cols-3 gap-2 bg-slate-900 border-t border-slate-800">
                                        <button
                                            onClick={() => handleAction(item, "schedule")}
                                            className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-slate-800 text-gray-400 hover:text-white transition group/btn"
                                        >
                                            <Calendar className="w-4 h-4 group-hover/btn:text-blue-400 transition-colors" />
                                            <span className="text-[10px] uppercase font-bold">Schedule</span>
                                        </button>
                                        <button
                                            onClick={() => handleAction(item, "broadcast")}
                                            className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-slate-800 text-gray-400 hover:text-white transition group/btn"
                                        >
                                            <Share2 className="w-4 h-4 group-hover/btn:text-green-400 transition-colors" />
                                            <span className="text-[10px] uppercase font-bold">Post</span>
                                        </button>
                                        <button
                                            onClick={() => handleAction(item, "download")}
                                            className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-slate-800 text-gray-400 hover:text-white transition group/btn"
                                        >
                                            <Download className="w-4 h-4 group-hover/btn:text-purple-400 transition-colors" />
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
