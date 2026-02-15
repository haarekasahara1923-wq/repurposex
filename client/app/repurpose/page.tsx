"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
    Sparkles,
    Upload,
    Link as LinkIcon,
    FileText,
    Video,
    Mic,
    Image as ImageIcon,
    Check,
    Wand2,
    Play,
    Download,
    Calendar,
    Share2,
    Scissors,
    MonitorPlay,
    Type,
    Layers,
    MoveRight,
    Loader2,
    Youtube,
    Instagram,
    Twitter,
    Linkedin,
    Layout as LayoutIcon,
    Smartphone,
    Globe,
    Files as FilesIconLucide
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import { contentAPI } from "@/lib/api";

// Mock Data Types
type AspectRatio = "9:16" | "1:1" | "16:9" | "twitter";
type ContentType = "video" | "document";
type DocStyle = "blog" | "newsletter" | "mail" | "post";

const ASPECT_CLASS_MAP: Record<string, string> = {
    "9:16": "aspect-[9/16]",
    "1:1": "aspect-square",
    "16:9": "aspect-video",
    "twitter": "aspect-[1.20/1]"
};

interface GeneratedItem {
    id: string;
    title: string;
    description: string;
    content?: string; // Add this for the full content
    type: "short" | "text";
    status: "ready" | "scheduled" | "published";
    platform?: string;
    startTime?: number;
    endTime?: number;
    previewUrl?: string;
}

export default function RepurposeWizard() {
    const router = useRouter();
    const { isAuthenticated } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [mounted, setMounted] = useState(false);

    // Steps: upload -> configure -> processing -> results
    const [step, setStep] = useState<"upload" | "configure" | "processing" | "results">("upload");
    const [contentType, setContentType] = useState<ContentType>("video");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [urlInput, setUrlInput] = useState("");
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [extractedText, setExtractedText] = useState<string>(""); // New state for document content

    // Create object URL when file is selected
    useEffect(() => {
        if (selectedFile && contentType === "video") {
            const url = URL.createObjectURL(selectedFile);
            setVideoUrl(url);
            return () => {
                // URL.revokeObjectURL(url); 
            };
        } else if (urlInput && contentType === "video") {
            setVideoUrl(urlInput);
        }
    }, [selectedFile, urlInput, contentType]);

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

    const [generatedItems, setGeneratedItems] = useState<GeneratedItem[]>([]);
    const [processingProgress, setProcessingProgress] = useState(0);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    if (!isAuthenticated) {
        router.push("/login");
        return null;
    }

    // Handlers
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);

            if (contentType === "document") {
                if (file.type === "text/plain") {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        const text = event.target?.result as string;
                        setExtractedText(text);
                    };
                    reader.readAsText(file);
                } else {
                    // Placeholder for other formats while simulation
                    setExtractedText(`[Content from ${file.name}]\n\nThis is a simulated extraction of your document. In the full version, our AI will parse the entire ${file.name.split('.').pop()?.toUpperCase()} file for insights.`);
                }
            }

            setStep("configure");
            toast.success("File uploaded successfully!");
        }
    };

    const handleGoogleDrive = () => {
        toast.error("Google Drive integration coming soon!");
    };

    const handleDropLink = () => {
        if (!urlInput) {
            toast.error("Please enter a valid URL");
            return;
        }
        setStep("configure");
        toast.success("Link verified!");
    };

    const startProcessing = async () => {
        setStep("processing");
        setProcessingProgress(0);

        // Upload to Content Library in the background
        if (selectedFile) {
            try {
                const formData = new FormData();
                formData.append("file", selectedFile);
                formData.append("contentType", contentType);

                contentAPI.upload(formData)
                    .then(() => {
                        toast.success("Added to Content Library");
                    })
                    .catch(err => {
                        console.error("Library upload failed", err);
                    });
            } catch (e) {
                console.error("Upload preparation failed", e);
            }
        }

        // Simulate AI Processing
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
        }, 150); // ~3 seconds total
    };

    const generateMockResults = () => {
        const items: GeneratedItem[] = [];
        const count = contentType === "video" ? videoConfig.numShorts : docConfig.numPieces;

        for (let i = 1; i <= count; i++) {
            const startTime = i * 20;
            const endTime = startTime + 10;
            const hook = generateHook();

            const body = contentType === "video"
                ? `[Video Clip Fragment #${i}]`
                : generateMockBlogContent(extractedText || `Title: ${selectedFile?.name}\nDescription: Generated piece for ${docConfig.style}`, i, docConfig.style);

            items.push({
                id: `gen-${i}`,
                title: contentType === "video"
                    ? `Viral Highlight #${i}: ${hook}`
                    : `${docConfig.style.toUpperCase()} #${i}: ${hook}`,
                description: contentType === "video"
                    ? "Optimized with AI hooks and dynamic framing."
                    : (body.substring(0, 150) + "..."),
                content: body,
                type: contentType === "video" ? "short" : "text",
                status: "ready",
                startTime: contentType === "video" ? startTime : undefined,
                endTime: contentType === "video" ? endTime : undefined
            });
        }
        setGeneratedItems(items);
        toast.success("Content generated successfully!");
    };

    const generateMockBlogContent = (source: string, index: number, style: DocStyle) => {
        const sentences = source.split(/[.!?]/).filter(s => s.trim().length > 10);
        const title = sentences[0]?.trim() || "Engaging Analysis";

        const introHooks = [
            "The secret to mastering this topic is simpler than you think.",
            "If you're not paying attention to this, you're falling behind.",
            "Everybody talks about the obvious, but nobody mentions this.",
            "Stop what you're doing and look at these key insights.",
            "The landscape is changing, and here's how you can stay ahead."
        ];

        const content = sentences.length > 3
            ? sentences.slice(Math.min(index + 1, sentences.length - 2), Math.min(index + 5, sentences.length)).join(". ")
            : "This repurposed content provides a deep dive into the core themes of your document, optimized for maximum engagement and clarity on your chosen platform.";

        return `# ${title}\n\n${introHooks[index % introHooks.length]}\n\n${content}\n\nThis ${style} was automatically generated and enhanced with AI hooks to ensure your message resonates with your audience.\n\n#${style} #contentstrategy #repurpose`;
    };

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

    const handleAction = async (id: string, action: "schedule" | "broadcast" | "download") => {
        const item = generatedItems.find(i => i.id === id);
        if (!item) return;

        if (action === "download") {
            try {
                if (contentType === "video" && videoUrl) {
                    if (videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be")) {
                        toast.error("YouTube content cannot be downloaded directly in simulation mode.", {
                            duration: 5000,
                            icon: '⚠️'
                        });
                        return;
                    }

                    toast.loading("Preparing download...", { id: "download" });

                    // Direct download for Blob URLs (local files)
                    if (videoUrl.startsWith('blob:')) {
                        const link = document.createElement("a");
                        link.href = videoUrl;
                        link.download = `${item.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.mp4`; // Note: browsers might ignore filename for cross-origin, but blob: is same-origin
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        toast.success("Download started! (Full source video)", { id: "download" });
                        return;
                    }

                    try {
                        const response = await fetch(videoUrl);
                        if (!response.ok) throw new Error(`HTTP ${response.status}`);
                        const blob = await response.blob();
                        const blobUrl = window.URL.createObjectURL(blob);

                        const link = document.createElement("a");
                        link.href = blobUrl;
                        link.download = `${item.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.mp4`;
                        link.style.display = 'none';
                        document.body.appendChild(link);
                        link.click();

                        setTimeout(() => {
                            window.URL.revokeObjectURL(blobUrl);
                            document.body.removeChild(link);
                        }, 1000);

                        toast.success("Download started!", { id: "download" });
                    } catch (fetchError) {
                        console.warn("Fetch download failed:", fetchError);
                        // Fallback: Direct link navigation (may open in new tab if cross-origin)
                        const link = document.createElement("a");
                        link.href = videoUrl;
                        link.setAttribute("download", `${item.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.mp4`);
                        link.target = "_blank"; // Force new tab if it fails to download, to avoid navigating away
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        toast.success("Opening video (Right click to Save As)", { id: "download" });
                    }
                } else {
                    const downloadContent = item.content || `${item.title}\n\n${item.description}`;
                    const blob = new Blob([downloadContent], { type: "text/plain" });
                    const blobUrl = URL.createObjectURL(blob);
                    const link = document.createElement("a");
                    link.href = blobUrl;
                    link.download = `${item.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
                    toast.success("Text clip saved!");
                }
            } catch (error) {
                console.error("Download error:", error);
                toast.error("Failed to save content.", { id: "download" });
            }
        } else if (action === "schedule") {
            const params = new URLSearchParams({
                title: item.title,
                description: item.description,
                type: item.type
            });
            router.push(`/schedule?${params.toString()}`);
        } else if (action === "broadcast") {
            const params = new URLSearchParams({
                title: item.title,
                description: item.description,
                type: item.type,
                broadcast: "true"
            });
            router.push(`/schedule?${params.toString()}`);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white pb-20">
            <nav className="bg-slate-900/50 backdrop-blur-lg border-b border-white/10 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-8 h-8 text-purple-400" />
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-200">
                                RepurposeX Wizard
                            </span>
                        </div>
                        <button
                            onClick={() => router.push("/dashboard")}
                            className="text-gray-400 hover:text-white transition"
                        >
                            Exit Wizard
                        </button>
                    </div>
                </div>
            </nav>

            <main className="max-w-5xl mx-auto px-4 py-12">
                {step === "upload" && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="text-center mb-12">
                            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400">
                                What would you like to repurpose?
                            </h1>
                            <p className="text-gray-400 text-lg">Select your source content type to begin</p>
                        </div>
                        <div className="flex justify-center gap-6 mb-12">
                            <button
                                onClick={() => setContentType("video")}
                                className={`flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all duration-300 w-40 ${contentType === "video"
                                    ? "border-purple-500 bg-purple-500/10 shadow-[0_0_30px_rgba(168,85,247,0.2)]"
                                    : "border-slate-800 bg-slate-900/50 text-gray-400 hover:border-purple-500/50"
                                    }`}
                            >
                                <Video className={`w-10 h-10 ${contentType === "video" ? "text-purple-400" : "text-gray-500"}`} />
                                <span className="font-bold">Video</span>
                            </button>
                            <button
                                onClick={() => setContentType("document")}
                                className={`flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all duration-300 w-40 ${contentType === "document"
                                    ? "border-pink-500 bg-pink-500/10 shadow-[0_0_30px_rgba(236,72,153,0.2)]"
                                    : "border-slate-800 bg-slate-900/50 text-gray-400 hover:border-pink-500/50"
                                    }`}
                            >
                                <FileText className={`w-10 h-10 ${contentType === "document" ? "text-pink-400" : "text-gray-500"}`} />
                                <span className="font-bold">Document</span>
                            </button>
                        </div>
                        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="group relative overflow-hidden bg-slate-900/50 border border-slate-800 hover:border-purple-500/50 rounded-2xl p-8 text-center transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <ImageIcon className="w-12 h-12 text-purple-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                                <h3 className="text-xl font-bold mb-2">Upload from Gallery</h3>
                                <p className="text-sm text-gray-500">Select files from your device</p>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    className="hidden"
                                    accept={contentType === "video" ? "video/*" : ".pdf,.docx,.txt"}
                                    onChange={handleFileSelect}
                                />
                            </button>
                            <button
                                onClick={handleGoogleDrive}
                                className="group relative overflow-hidden bg-slate-900/50 border border-slate-800 hover:border-blue-500/50 rounded-2xl p-8 text-center transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="w-12 h-12 mx-auto mb-4 bg-white/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <svg className="w-8 h-8" viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg"><path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da" /><path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5z" fill="#00ac47" /><path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.85 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335" /><path d="m43.65 25 13.75 23.8-13.75 23.8-13.75-23.8z" fill="#00832d" /><path d="m59.8 53.2h-27.5l-13.75 23.8 13.75 23.8h27.5c1.55 0 3.1-.4 4.5-1.2l5.85-11.5z" fill="#2684fc" /><path d="m73.4 26.5-12.75-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.7 23.8 13.75 23.8 4.5-1.2c1.4-.8 2.5-1.9 3.3-3.3z" fill="#ffba00" /></svg>
                                </div>
                                <h3 className="text-xl font-bold mb-2">Google Drive</h3>
                                <p className="text-sm text-gray-500">Import directly from Drive</p>
                            </button>
                            <div className="group relative overflow-hidden bg-slate-900/50 border border-slate-800 hover:border-pink-500/50 rounded-2xl p-8 text-center transition-all duration-300">
                                <LinkIcon className="w-12 h-12 text-pink-400 mx-auto mb-4" />
                                <h3 className="text-xl font-bold mb-2">Drop a Link</h3>
                                <div className="flex gap-2 mt-4">
                                    <input
                                        type="text"
                                        placeholder="Paste YouTube URL..."
                                        value={urlInput}
                                        onChange={(e) => setUrlInput(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500 outline-none"
                                    />
                                    <button
                                        onClick={handleDropLink}
                                        className="bg-pink-600 hover:bg-pink-700 text-white p-2 rounded-lg transition"
                                    >
                                        <MoveRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {step === "configure" && (
                    <div className="animate-in fade-in slide-in-from-right-8 duration-500 max-w-4xl mx-auto">
                        <div className="flex items-center gap-4 mb-8">
                            <button onClick={() => setStep("upload")} className="text-gray-400 hover:text-white">
                                <MoveRight className="w-6 h-6 rotate-180" />
                            </button>
                            <h2 className="text-3xl font-bold">Configure Repurposing</h2>
                            <div className="ml-auto bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-bold border border-green-500/30">
                                {selectedFile ? selectedFile.name : "URL Source"}
                            </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 flex items-center justify-center min-h-[300px]">
                                {contentType === "video" ? (
                                    <div className="w-full aspect-video bg-black rounded-lg overflow-hidden relative shadow-lg">
                                        {(() => {
                                            const ytId = videoUrl ? getYoutubeId(videoUrl) : null;
                                            if (ytId) {
                                                return (
                                                    <iframe
                                                        width="100%"
                                                        height="100%"
                                                        src={`https://www.youtube.com/embed/${ytId}?autoplay=0&rel=0`}
                                                        title="YouTube video player"
                                                        frameBorder="0"
                                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                        allowFullScreen
                                                        className="w-full h-full object-contain"
                                                    />
                                                );
                                            }
                                            return videoUrl ? (
                                                <video
                                                    key={videoUrl}
                                                    src={videoUrl}
                                                    className="w-full h-full object-contain"
                                                    controls
                                                    playsInline
                                                />
                                            ) : (
                                                <div className="text-center">
                                                    <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                                                        <Play className="w-8 h-8 text-purple-400 ml-1" />
                                                    </div>
                                                    <p className="text-gray-400">Preview Unavailable</p>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                ) : (
                                    <div className="w-full h-full bg-slate-950 rounded-lg p-6 border border-slate-800 overflow-auto max-h-[400px]">
                                        <div className="flex items-center gap-2 mb-4 text-pink-400">
                                            <FileText className="w-5 h-5" />
                                            <span className="font-bold">Source Document</span>
                                        </div>
                                        <div className="text-gray-300 text-sm whitespace-pre-wrap font-mono leading-relaxed">
                                            {extractedText || `No text preview available for ${selectedFile?.name}. AI will analyze the full content during generation.`}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="bg-slate-900/50 rounded-2xl p-8 border border-slate-800">
                                {contentType === "video" ? (
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
                                        </div>
                                        <div>
                                            <label className="flex items-center gap-2 text-lg font-bold mb-4 text-white">
                                                <LayoutIcon className="w-5 h-5 text-pink-400" />
                                                Reframe Video
                                            </label>
                                            <div className="grid grid-cols-4 gap-3">
                                                {[
                                                    { id: "9:16", label: "9:16", icon: Smartphone },
                                                    { id: "1:1", label: "1:1", icon: LayoutIcon },
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
                                        <div>
                                            <label className="flex items-center gap-2 text-lg font-bold mb-4 text-white">
                                                <FilesIconLucide className="w-5 h-5 text-pink-400" />
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

                {step === "results" && (
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                            <div>
                                <h2 className="text-3xl font-bold mb-1">Your Repurposed Content</h2>
                                <p className="text-gray-400">
                                    Generated {generatedItems.length} {contentType === "video" ? "Shorts" : "Pieces"} from your source.
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

                        <div className="flex items-center gap-2 mb-4">
                            <input
                                type="checkbox"
                                id="selectAll"
                                checked={selectedItems.size === generatedItems.length && generatedItems.length > 0}
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
                                Select All {contentType === "video" ? "Shorts" : "Pieces"}
                            </label>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {generatedItems.map((item) => (
                                <ResultCard
                                    key={item.id}
                                    item={item}
                                    contentType={contentType}
                                    videoConfig={videoConfig}
                                    videoUrl={videoUrl}
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

// Helper to get YouTube ID
function getYoutubeId(url: string | null) {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

// Sub-component for individual result items to manage state locally
function ResultCard({ item, contentType, videoConfig, videoUrl, handleAction, selectedItems, setSelectedItems }: any) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isYTActive, setIsYTActive] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    const togglePlay = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        // Prevent trigger if clicking on buttons or checkboxes
        if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('input')) {
            return;
        }

        if (videoRef.current) {
            if (videoRef.current.paused) {
                videoRef.current.play().catch(console.error);
            } else {
                videoRef.current.pause();
            }
        } else {
            // For YouTube
            setIsYTActive(true);
            setIsPlaying(true);
        }
    };

    const isSelected = selectedItems.has(item.id);

    return (
        <div
            className={`relative bg-slate-900 border rounded-2xl overflow-hidden group transition-all duration-300 ${isSelected
                ? "border-purple-500 ring-2 ring-purple-500/20 shadow-2xl"
                : "border-slate-800 hover:border-purple-500/50"
                }`}
        >
            {/* Selection Checkbox */}
            <div className="absolute top-3 left-3 z-30">
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => {
                        e.stopPropagation();
                        const newSet = new Set(selectedItems);
                        if (e.target.checked) newSet.add(item.id);
                        else newSet.delete(item.id);
                        setSelectedItems(newSet);
                    }}
                    className="w-5 h-5 rounded border-white/20 bg-black/50 backdrop-blur text-purple-600 focus:ring-purple-500 cursor-pointer"
                />
            </div>

            {/* Media Container */}
            <div
                className={`${contentType === "video" ? (ASPECT_CLASS_MAP[videoConfig.aspectRatio] || "aspect-[9/16]") : "aspect-[9/16]"} bg-black relative flex items-center justify-center overflow-hidden cursor-pointer reframed-video-container`}
                onClick={togglePlay}
            >
                {contentType === "video" ? (
                    <>
                        {videoUrl && (
                            (() => {
                                const ytId = getYoutubeId(videoUrl);

                                if (ytId) {
                                    return (
                                        <div className="absolute inset-0 bg-black">
                                            <div className={`${videoConfig.aspectRatio === '1:1' ? 'w-[177%] h-full' : 'w-[300%] h-full'} absolute left-1/2 -translate-x-1/2`}>
                                                <iframe
                                                    width="100%"
                                                    height="100%"
                                                    src={`https://www.youtube.com/embed/${ytId}?start=${item.startTime}&end=${item.endTime}&controls=1&mute=0&autoplay=${isYTActive ? 1 : 0}&rel=0&modestbranding=1&enablejsapi=1`}
                                                    frameBorder="0"
                                                    className={`w-full h-full transition-opacity duration-700 ${isYTActive ? 'opacity-100' : 'opacity-30'}`}
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                />
                                            </div>
                                        </div>
                                    );
                                }

                                return (
                                    <video
                                        ref={videoRef}
                                        src={`${videoUrl}#t=${item.startTime || 0},${item.endTime || 10}`}
                                        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
                                        style={{ opacity: isPlaying ? 1 : 0.8 }}
                                        muted
                                        playsInline
                                        loop={false}
                                        onPlay={() => setIsPlaying(true)}
                                        onPlaying={() => setIsPlaying(true)}
                                        onPause={() => setIsPlaying(false)}
                                        onEnded={() => {
                                            // Manual loop logic to ensure it stays within bounds if browser ignores fragments
                                            if (videoRef.current) {
                                                videoRef.current.currentTime = item.startTime || 0;
                                                videoRef.current.play().catch(() => setIsPlaying(false));
                                            }
                                        }}
                                        onTimeUpdate={() => {
                                            const v = videoRef.current;
                                            if (v && isPlaying) {
                                                const end = item.endTime;
                                                // Check if we passed the end time (with buffer)
                                                if (end && v.currentTime >= end) {
                                                    v.pause();
                                                    v.currentTime = item.startTime || 0;
                                                    v.play().catch(() => setIsPlaying(false));
                                                }
                                            }
                                        }}
                                    />
                                );
                            })()
                        )}

                        {/* Play Overlay */}
                        <div className={`play-overlay absolute inset-0 bg-black/40 flex items-center justify-center z-10 transition-all duration-300 ${isPlaying ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-100 scale-100 cursor-pointer'}`}>
                            <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 shadow-xl hover:scale-110 transition-transform duration-300">
                                <Play className="w-6 h-6 text-white ml-1 fill-white" />
                            </div>
                        </div>

                        {/* Bottom Info */}
                        <div className="absolute inset-x-0 bottom-0 p-5 z-20 pointer-events-none bg-gradient-to-t from-black/90 to-transparent">
                            <h3 className="font-bold text-white text-sm mb-2 line-clamp-1 drop-shadow-md">{item.title}</h3>
                            <div className="flex gap-2">
                                <span className="text-[10px] font-black bg-purple-600/90 text-white px-2 py-0.5 rounded shadow-sm border border-purple-400/30 uppercase tracking-tighter">{videoConfig.aspectRatio}</span>
                                <span className="text-[10px] font-black bg-blue-600/90 text-white px-2 py-0.5 rounded shadow-sm border border-blue-400/30 uppercase tracking-tighter">AI READY</span>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="w-full h-full bg-slate-50 p-6 group-hover:bg-white transition-colors duration-500 flex flex-col items-start text-left relative">
                        <FileText className="w-8 h-8 text-slate-200 absolute -top-1 -right-1 transform rotate-12" />
                        <h3 className="text-slate-900 font-bold text-base mb-3 line-clamp-2">{item.title}</h3>
                        <div className="flex-1 overflow-hidden relative w-full">
                            <p className="text-slate-600 text-[11px] leading-relaxed font-medium">{item.content}</p>
                            <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-slate-50 to-transparent group-hover:from-white" />
                        </div>
                        <div className="mt-auto pt-3 border-t border-slate-200 w-full flex gap-2">
                            <span className="text-[9px] font-black bg-slate-200 text-slate-500 px-2 py-0.5 rounded uppercase tracking-tighter">TEXT CLIPPED</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="p-1 grid grid-cols-3 gap-1 bg-black/60 border-t border-white/5 relative z-30 backdrop-blur-md">
                <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleAction(item.id, "schedule"); }}
                    className="py-3 flex flex-col items-center gap-1 hover:bg-white/5 rounded-xl transition-all group/btn"
                >
                    <Calendar className="w-4 h-4 text-gray-500 group-hover/btn:text-blue-400" />
                    <span className="text-[9px] font-black text-gray-500 group-hover/btn:text-gray-300 uppercase tracking-tighter">Schedule</span>
                </button>
                <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleAction(item.id, "broadcast"); }}
                    className="py-3 flex flex-col items-center gap-1 hover:bg-white/5 rounded-xl transition-all group/btn"
                >
                    <Share2 className="w-4 h-4 text-gray-500 group-hover/btn:text-green-400" />
                    <span className="text-[9px] font-black text-gray-500 group-hover/btn:text-gray-300 uppercase tracking-tighter">Post</span>
                </button>
                <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleAction(item.id, "download"); }}
                    className="py-3 flex flex-col items-center gap-1 hover:bg-white/5 rounded-xl transition-all group/btn"
                >
                    <Download className="w-4 h-4 text-gray-500 group-hover/btn:text-purple-400" />
                    <span className="text-[9px] font-black text-gray-500 group-hover/btn:text-gray-300 uppercase tracking-tighter">Save</span>
                </button>
            </div>
        </div>
    );
}
