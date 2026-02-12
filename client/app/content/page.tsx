"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Sparkles,
    Video,
    Music,
    FileText,
    Plus,
    Trash2,
    Eye,
    Wand2,
    Search,
    Filter,
    Calendar,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { contentAPI, ContentAsset } from "@/lib/api";
import toast from "react-hot-toast";

export default function ContentLibraryPage() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuth();

    const [mounted, setMounted] = useState(false);
    const [content, setContent] = useState<ContentAsset[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterType, setFilterType] = useState<string>("all");

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (isAuthenticated) {
            loadContent();
        }
    }, [isAuthenticated]);

    const loadContent = async () => {
        try {
            setLoading(true);
            const data = await contentAPI.getAll();
            // Ensure data is an array
            if (Array.isArray(data)) {
                // Map backend fields if needed
                const mappedData = data.map(item => ({
                    ...item,
                    type: (item as any).contentType || item.type || 'unknown',
                }));
                setContent(mappedData);
            } else {
                console.error("Received non-array data:", data);
                setContent([]);
            }
        } catch (error) {
            console.error("Failed to load content:", error);
            toast.error("Failed to load content");
        } finally {
            setLoading(false);
        }
    };

    if (!mounted) return null;

    // Redirect if not authenticated
    if (!isAuthenticated) {
        router.push("/login");
        return null;
    }



    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this content?")) return;

        try {
            await contentAPI.delete(id);
            toast.success("Content deleted successfully");
            loadContent(); // Reload
        } catch (error) {
            console.error("Delete error:", error);
            toast.error("Failed to delete content");
        }
    };

    const getIcon = (type: string) => {
        const lowerType = (type || "").toLowerCase();
        if (lowerType.includes("video")) return <Video className="w-6 h-6 text-purple-400" />;
        if (lowerType.includes("audio")) return <Music className="w-6 h-6 text-pink-400" />;
        return <FileText className="w-6 h-6 text-blue-400" />;
    };

    const formatDate = (date: string) => {
        if (!date) return "Unknown date";
        return new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const formatFileSize = (bytes?: any) => {
        if (!bytes) return "Unknown";
        const numBytes = Number(bytes);
        if (isNaN(numBytes)) return "Unknown";

        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(numBytes) / Math.log(k));
        return Math.round((numBytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
    };

    const filteredContent = content.filter((item) => {
        const matchesSearch =
            (item.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.description || "").toLowerCase().includes(searchQuery.toLowerCase());

        const type = (item.type || "").toLowerCase();
        const matchesFilter =
            filterType === "all" ||
            (filterType === "video" && type.includes("video")) ||
            (filterType === "audio" && type.includes("audio")) ||
            (filterType === "document" && !type.includes("video") && !type.includes("audio"));

        return matchesSearch && matchesFilter;
    });

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
                            <Link
                                href="/upload"
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition"
                            >
                                <Plus className="w-4 h-4" />
                                Upload Content
                            </Link>
                            <Link
                                href="/dashboard"
                                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition"
                            >
                                Dashboard
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Title & Search */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white mb-3">Content Library</h1>
                    <p className="text-gray-400 mb-6">Manage and repurpose your content</p>

                    {/* Search & Filter */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search content..."
                                className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>

                        <div className="flex gap-2">
                            {["all", "video", "audio", "document"].map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setFilterType(type)}
                                    className={`px-4 py-3 rounded-xl font-medium transition capitalize ${filterType === type
                                        ? "bg-purple-600 text-white"
                                        : "bg-white/10 text-gray-400 hover:bg-white/20"
                                        }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Content Grid */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                            <p className="text-gray-400">Loading your content...</p>
                        </div>
                    </div>
                ) : filteredContent.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-12 max-w-md mx-auto">
                            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-white mb-2">No content yet</h3>
                            <p className="text-gray-400 mb-6">
                                {searchQuery || filterType !== "all"
                                    ? "No content matches your search"
                                    : "Upload your first piece of content to get started"}
                            </p>
                            <Link
                                href="/upload"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition"
                            >
                                <Plus className="w-5 h-5" />
                                Upload Content
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredContent.map((item) => (
                            <div
                                key={item.id}
                                className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-6 hover:border-purple-500/50 transition group"
                            >
                                {/* Icon & Type */}
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                                        {getIcon(item.type)}
                                    </div>
                                    <span className="text-xs text-gray-400 bg-white/5 px-3 py-1 rounded-full">
                                        {item.type.split("/")[0]}
                                    </span>
                                </div>

                                {/* Title & Description */}
                                <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                                    {item.title}
                                </h3>
                                {item.description && (
                                    <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                                        {item.description}
                                    </p>
                                )}

                                {/* Meta Info */}
                                <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {formatDate(item.createdAt)}
                                    </span>
                                    {item.fileSize && (
                                        <span>{formatFileSize(item.fileSize)}</span>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2">
                                    <Link
                                        href={`/content/${item.id}`}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 rounded-lg transition"
                                    >
                                        <Eye className="w-4 h-4" />
                                        View
                                    </Link>
                                    <Link
                                        href={`/repurpose/${item.id}`}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-pink-600/20 hover:bg-pink-600/30 text-pink-400 rounded-lg transition"
                                    >
                                        <Wand2 className="w-4 h-4" />
                                        Repurpose
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Stats */}
                {!loading && content.length > 0 && (
                    <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-6 text-center">
                            <p className="text-3xl font-bold text-white mb-1">{content.length}</p>
                            <p className="text-sm text-gray-400">Total Content</p>
                        </div>
                        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-6 text-center">
                            <p className="text-3xl font-bold text-white mb-1">
                                {content.filter((c) => c.type.includes("video")).length}
                            </p>
                            <p className="text-sm text-gray-400">Videos</p>
                        </div>
                        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-6 text-center">
                            <p className="text-3xl font-bold text-white mb-1">
                                {content.filter((c) => c.type.includes("audio")).length}
                            </p>
                            <p className="text-sm text-gray-400">Audio Files</p>
                        </div>
                        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-6 text-center">
                            <p className="text-3xl font-bold text-white mb-1">
                                {content.filter((c) => !c.type.includes("video") && !c.type.includes("audio")).length}
                            </p>
                            <p className="text-sm text-gray-400">Documents</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
