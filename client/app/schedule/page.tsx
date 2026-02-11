"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Sparkles,
    Calendar as CalendarIcon,
    Plus,
    Clock,
    Trash2,
    Edit,
    Send,
    Linkedin,
    Twitter,
    Instagram,
    Youtube,
    Facebook,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

interface ScheduledPost {
    id: string;
    title: string;
    content: string;
    platform: string;
    scheduledFor: Date;
    status: "scheduled" | "published" | "failed";
}

export default function SchedulePage() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuth();

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const [view, setView] = useState<"calendar" | "list">("list");
    const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([
        {
            id: "1",
            title: "Sample LinkedIn Post",
            content: "Check out our latest blog post about AI...",
            platform: "linkedin",
            scheduledFor: new Date(Date.now() + 86400000),
            status: "scheduled",
        },
        {
            id: "2",
            title: "Twitter Thread about Content",
            content: "🧵 Thread about content repurposing...",
            platform: "twitter",
            scheduledFor: new Date(Date.now() + 172800000),
            status: "scheduled",
        },
    ]);

    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [newPost, setNewPost] = useState({
        title: "",
        content: "",
        platform: "linkedin",
        scheduledFor: "",
    });

    if (!mounted) return null;

    if (!isAuthenticated) {
        router.push("/login");
        return null;
    }

    const getPlatformIcon = (platform: string) => {
        const icons: any = {
            linkedin: <Linkedin className="w-5 h-5 text-blue-500" />,
            twitter: <Twitter className="w-5 h-5 text-sky-400" />,
            instagram: <Instagram className="w-5 h-5 text-pink-500" />,
            youtube: <Youtube className="w-5 h-5 text-red-500" />,
            facebook: <Facebook className="w-5 h-5 text-blue-600" />,
        };
        return icons[platform] || <Send className="w-5 h-5" />;
    };

    const handleSchedule = () => {
        if (!newPost.title || !newPost.content || !newPost.scheduledFor) {
            toast.error("Please fill in all fields");
            return;
        }

        const post: ScheduledPost = {
            id: Date.now().toString(),
            title: newPost.title,
            content: newPost.content,
            platform: newPost.platform,
            scheduledFor: new Date(newPost.scheduledFor),
            status: "scheduled",
        };

        setScheduledPosts([...scheduledPosts, post]);
        setShowScheduleModal(false);
        setNewPost({ title: "", content: "", platform: "linkedin", scheduledFor: "" });
        toast.success("Post scheduled successfully!");
    };

    const handleDelete = (id: string) => {
        setScheduledPosts(scheduledPosts.filter((p) => p.id !== id));
        toast.success("Post deleted");
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
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
                            <button
                                onClick={() => setShowScheduleModal(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition"
                            >
                                <Plus className="w-4 h-4" />
                                Schedule Post
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Title & View Toggle */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">Content Calendar</h1>
                        <p className="text-gray-400">Schedule and manage your posts across platforms</p>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => setView("list")}
                            className={`px-4 py-2 rounded-lg font-medium transition ${view === "list"
                                ? "bg-purple-600 text-white"
                                : "bg-white/10 text-gray-400 hover:bg-white/20"
                                }`}
                        >
                            List View
                        </button>
                        <button
                            onClick={() => setView("calendar")}
                            className={`px-4 py-2 rounded-lg font-medium transition ${view === "calendar"
                                ? "bg-purple-600 text-white"
                                : "bg-white/10 text-gray-400 hover:bg-white/20"
                                }`}
                        >
                            Calendar View
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-6 mb-8">
                    <div className="bg-white/10 backdrop-blur border border-white/20 rounded-xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm mb-1">Scheduled</p>
                                <p className="text-3xl font-bold text-white">
                                    {scheduledPosts.filter((p) => p.status === "scheduled").length}
                                </p>
                            </div>
                            <Clock className="w-10 h-10 text-purple-400" />
                        </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur border border-white/20 rounded-xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm mb-1">Published</p>
                                <p className="text-3xl font-bold text-white">
                                    {scheduledPosts.filter((p) => p.status === "published").length}
                                </p>
                            </div>
                            <Send className="w-10 h-10 text-green-400" />
                        </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur border border-white/20 rounded-xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm mb-1">This Week</p>
                                <p className="text-3xl font-bold text-white">{scheduledPosts.length}</p>
                            </div>
                            <CalendarIcon className="w-10 h-10 text-blue-400" />
                        </div>
                    </div>
                </div>

                {/* Scheduled Posts List */}
                {view === "list" && (
                    <div className="space-y-4">
                        {scheduledPosts.length === 0 ? (
                            <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-12 text-center">
                                <CalendarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-white mb-2">No Scheduled Posts</h3>
                                <p className="text-gray-400 mb-6">Start scheduling your content to see it here</p>
                                <button
                                    onClick={() => setShowScheduleModal(true)}
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition"
                                >
                                    <Plus className="w-5 h-5" />
                                    Schedule First Post
                                </button>
                            </div>
                        ) : (
                            scheduledPosts
                                .sort((a, b) => a.scheduledFor.getTime() - b.scheduledFor.getTime())
                                .map((post) => (
                                    <div
                                        key={post.id}
                                        className="bg-white/10 backdrop-blur border border-white/20 rounded-xl p-6 hover:border-purple-500/50 transition"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-4 flex-1">
                                                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                                                    {getPlatformIcon(post.platform)}
                                                </div>

                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h3 className="text-lg font-semibold text-white">{post.title}</h3>
                                                        <span
                                                            className={`px-3 py-1 rounded-full text-xs font-medium ${post.status === "scheduled"
                                                                ? "bg-yellow-500/20 text-yellow-300"
                                                                : post.status === "published"
                                                                    ? "bg-green-500/20 text-green-300"
                                                                    : "bg-red-500/20 text-red-300"
                                                                }`}
                                                        >
                                                            {post.status}
                                                        </span>
                                                    </div>

                                                    <p className="text-gray-400 mb-3 line-clamp-2">{post.content}</p>

                                                    <div className="flex items-center gap-4 text-sm text-gray-400">
                                                        <span className="flex items-center gap-2">
                                                            <Clock className="w-4 h-4" />
                                                            {formatDate(post.scheduledFor)}
                                                        </span>
                                                        <span className="capitalize">{post.platform}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex gap-2">
                                                <button className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition">
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(post.id)}
                                                    className="p-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                        )}
                    </div>
                )}

                {/* Calendar View Placeholder */}
                {view === "calendar" && (
                    <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-12 text-center">
                        <CalendarIcon className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                        <h3 className="text-2xl font-semibold text-white mb-2">Calendar View</h3>
                        <p className="text-gray-400 mb-6">
                            Interactive calendar view coming soon. For now, use List View to manage your schedule.
                        </p>
                        <button
                            onClick={() => setView("list")}
                            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                        >
                            Switch to List View
                        </button>
                    </div>
                )}
            </div>

            {/* Schedule Modal */}
            {showScheduleModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900 border border-white/20 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold text-white mb-6">Schedule New Post</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Post Title
                                </label>
                                <input
                                    type="text"
                                    value={newPost.title}
                                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="My awesome post"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Content
                                </label>
                                <textarea
                                    value={newPost.content}
                                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                                    rows={6}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="Write your post content..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Platform
                                </label>
                                <select
                                    value={newPost.platform}
                                    onChange={(e) => setNewPost({ ...newPost, platform: e.target.value })}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                    <option value="linkedin">LinkedIn</option>
                                    <option value="twitter">Twitter</option>
                                    <option value="instagram">Instagram</option>
                                    <option value="facebook">Facebook</option>
                                    <option value="youtube">YouTube</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Schedule For
                                </label>
                                <input
                                    type="datetime-local"
                                    value={newPost.scheduledFor}
                                    onChange={(e) => setNewPost({ ...newPost, scheduledFor: e.target.value })}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                        </div>

                        <div className="flex gap-4 mt-8">
                            <button
                                onClick={() => setShowScheduleModal(false)}
                                className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSchedule}
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition"
                            >
                                Schedule Post
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
