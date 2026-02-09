"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Sparkles,
    Upload as UploadIcon,
    File,
    X,
    Check,
    AlertCircle,
    Video,
    Music,
    FileText,
    Link as LinkIcon,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { contentAPI } from "@/lib/api";
import toast from "react-hot-toast";

export default function UploadPage() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [urlInput, setUrlInput] = useState("");
    const [uploadMode, setUploadMode] = useState<"file" | "url">("file");
    const [metadata, setMetadata] = useState({
        title: "",
        description: "",
        tags: "",
    });

    // Redirect if not authenticated
    if (!isAuthenticated) {
        router.push("/login");
        return null;
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            const validTypes = [
                "video/mp4",
                "video/quicktime",
                "video/x-msvideo",
                "audio/mpeg",
                "audio/wav",
                "audio/mp3",
                "application/pdf",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "text/plain",
            ];

            if (!validTypes.includes(file.type)) {
                toast.error("Invalid file type. Please upload video, audio, or document files.");
                return;
            }

            // Validate file size (max 2GB for Creator plan, 5GB for Pro)
            const maxSize = 2 * 1024 * 1024 * 1024; // 2GB
            if (file.size > maxSize) {
                toast.error("File size exceeds 2GB limit. Please upgrade to Pro for larger files.");
                return;
            }

            setSelectedFile(file);
            setMetadata(prev => ({
                ...prev,
                title: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
            }));
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const file = e.dataTransfer.files[0];
        if (file) {
            const fakeEvent = {
                target: { files: [file] },
            } as any;
            handleFileSelect(fakeEvent);
        }
    };

    const handleUpload = async () => {
        if (uploadMode === "file" && !selectedFile) {
            toast.error("Please select a file to upload");
            return;
        }

        if (uploadMode === "url" && !urlInput.trim()) {
            toast.error("Please enter a URL");
            return;
        }

        if (!metadata.title.trim()) {
            toast.error("Please enter a title");
            return;
        }

        setUploading(true);
        setProgress(0);

        try {
            const formData = new FormData();

            if (uploadMode === "file" && selectedFile) {
                formData.append("file", selectedFile);
            } else {
                formData.append("url", urlInput);
            }

            formData.append("title", metadata.title);
            formData.append("description", metadata.description);
            formData.append("tags", metadata.tags);

            const response = await contentAPI.upload(formData, (progressValue) => {
                setProgress(progressValue);
            });

            toast.success("Content uploaded successfully!");

            // Redirect to content library or analysis page
            setTimeout(() => {
                router.push(`/content/${response.id}`);
            }, 1000);
        } catch (error: any) {
            console.error("Upload error:", error);
            const message = error.response?.data?.message || "Upload failed";
            toast.error(message);
        } finally {
            setUploading(false);
        }
    };

    const getFileIcon = () => {
        if (!selectedFile) return <UploadIcon className="w-12 h-12" />;

        const type = selectedFile.type;
        if (type.startsWith("video/")) return <Video className="w-12 h-12 text-purple-400" />;
        if (type.startsWith("audio/")) return <Music className="w-12 h-12 text-pink-400" />;
        return <FileText className="w-12 h-12 text-blue-400" />;
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Header */}
            <nav className="bg-white/5 backdrop-blur-lg border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link href="/dashboard" className="flex items-center gap-2">
                            <Sparkles className="w-8 h-8 text-purple-400" />
                            <span className="text-xl font-bold text-white">RepurposeX</span>
                        </Link>

                        <div className="flex items-center gap-4">
                            <span className="text-gray-400">
                                {user?.firstName} {user?.lastName}
                            </span>
                            <Link
                                href="/dashboard"
                                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition"
                            >
                                Back to Dashboard
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Title */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white mb-3">Upload Content</h1>
                    <p className="text-gray-400">
                        Upload your video, audio, or document to start repurposing
                    </p>
                </div>

                {/* Upload Mode Toggle */}
                <div className="flex justify-center gap-4 mb-8">
                    <button
                        onClick={() => setUploadMode("file")}
                        className={`px-6 py-3 rounded-lg font-semibold transition ${uploadMode === "file"
                                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                                : "bg-white/10 text-gray-400 hover:bg-white/20"
                            }`}
                    >
                        <UploadIcon className="w-5 h-5 inline mr-2" />
                        Upload File
                    </button>
                    <button
                        onClick={() => setUploadMode("url")}
                        className={`px-6 py-3 rounded-lg font-semibold transition ${uploadMode === "url"
                                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                                : "bg-white/10 text-gray-400 hover:bg-white/20"
                            }`}
                    >
                        <LinkIcon className="w-5 h-5 inline mr-2" />
                        Import from URL
                    </button>
                </div>

                {/* Main Upload Card */}
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8">
                    {uploadMode === "file" ? (
                        <>
                            {/* File Upload Area */}
                            <div
                                onDragOver={handleDragOver}
                                onDrop={handleDrop}
                                className="border-2 border-dashed border-white/30 rounded-xl p-12 text-center hover:border-purple-500/50 transition cursor-pointer"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    className="hidden"
                                    onChange={handleFileSelect}
                                    accept="video/*,audio/*,.pdf,.docx,.txt"
                                    disabled={uploading}
                                />

                                {selectedFile ? (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-center">
                                            {getFileIcon()}
                                        </div>
                                        <div>
                                            <p className="text-white font-semibold text-lg">{selectedFile.name}</p>
                                            <p className="text-gray-400 text-sm mt-1">
                                                {formatFileSize(selectedFile.size)}
                                            </p>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedFile(null);
                                            }}
                                            className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition"
                                        >
                                            <X className="w-4 h-4 inline mr-2" />
                                            Remove
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-center">
                                            <UploadIcon className="w-16 h-16 text-gray-400" />
                                        </div>
                                        <div>
                                            <p className="text-white font-semibold mb-1">
                                                Drop your file here, or click to browse
                                            </p>
                                            <p className="text-gray-400 text-sm">
                                                Supported: MP4, MOV, MP3, WAV, PDF, DOCX (max 2GB)
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            {/* URL Import */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Content URL
                                    </label>
                                    <input
                                        type="url"
                                        value={urlInput}
                                        onChange={(e) => setUrlInput(e.target.value)}
                                        placeholder="https://youtube.com/watch?v=..."
                                        disabled={uploading}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition disabled:opacity-50"
                                    />
                                    <p className="text-xs text-gray-400 mt-2">
                                        Supported: YouTube, Instagram, LinkedIn, Twitter, Direct video/audio URLs
                                    </p>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Metadata Form */}
                    {(selectedFile || urlInput) && (
                        <div className="mt-8 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Title <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={metadata.title}
                                    onChange={(e) => setMetadata({ ...metadata, title: e.target.value })}
                                    placeholder="My Awesome Podcast Episode"
                                    disabled={uploading}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition disabled:opacity-50"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={metadata.description}
                                    onChange={(e) => setMetadata({ ...metadata, description: e.target.value })}
                                    placeholder="Describe your content..."
                                    disabled={uploading}
                                    rows={3}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition disabled:opacity-50"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Tags
                                </label>
                                <input
                                    type="text"
                                    value={metadata.tags}
                                    onChange={(e) => setMetadata({ ...metadata, tags: e.target.value })}
                                    placeholder="marketing, AI, productivity (comma-separated)"
                                    disabled={uploading}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition disabled:opacity-50"
                                />
                            </div>
                        </div>
                    )}

                    {/* Progress Bar */}
                    {uploading && (
                        <div className="mt-8">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-300">Uploading...</span>
                                <span className="text-sm text-purple-400">{progress}%</span>
                            </div>
                            <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                                <div
                                    className="bg-gradient-to-r from-purple-600 to-pink-600 h-full transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Upload Button */}
                    {(selectedFile || urlInput) && (
                        <button
                            onClick={handleUpload}
                            disabled={uploading || !metadata.title.trim()}
                            className="w-full mt-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {uploading ? (
                                `Uploading... ${progress}%`
                            ) : (
                                <>
                                    <UploadIcon className="w-5 h-5 inline mr-2" />
                                    Upload & Analyze
                                </>
                            )}
                        </button>
                    )}
                </div>

                {/* Info Cards */}
                <div className="grid md:grid-cols-3 gap-6 mt-8">
                    <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-6">
                        <Video className="w-10 h-10 text-purple-400 mb-3" />
                        <h3 className="text-white font-semibold mb-2">Video Content</h3>
                        <p className="text-gray-400 text-sm">
                            Upload videos for viral clip extraction and AI-powered repurposing
                        </p>
                    </div>

                    <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-6">
                        <Music className="w-10 h-10 text-pink-400 mb-3" />
                        <h3 className="text-white font-semibold mb-2">Audio Content</h3>
                        <p className="text-gray-400 text-sm">
                            Transform podcasts into blog posts, social media, and more
                        </p>
                    </div>

                    <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-6">
                        <FileText className="w-10 h-10 text-blue-400 mb-3" />
                        <h3 className="text-white font-semibold mb-2">Text Content</h3>
                        <p className="text-gray-400 text-sm">
                            Repurpose blogs and documents into multiple formats instantly
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
