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
    MessageCircle, // Fallback
    Check,
    Globe,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import Sidebar from "@/components/Sidebar";
import TopNav from "@/components/TopNav";

interface ScheduledPost {
    id: string;
    title: string;
    content: string;
    platforms: string[]; // Changed to array
    scheduledFor: Date;
    status: "scheduled" | "published" | "failed";
}

export default function SchedulePage() {
    const router = useRouter();
    const { user, isAuthenticated, logout } = useAuth();

    const [mounted, setMounted] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    useEffect(() => {
        setMounted(true);
    }, []);

    const [view, setView] = useState<"calendar" | "list">("list");
    const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([
        {
            id: "1",
            title: "Sample Multi-Platform Post",
            content: "Check out our latest blog post about AI...",
            platforms: ["linkedin", "twitter"],
            scheduledFor: new Date(Date.now() + 86400000),
            status: "scheduled",
        },
    ]);

    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [newPost, setNewPost] = useState({
        title: "",
        content: "",
        platforms: [] as string[],
        scheduledFor: "",
    });

    const [useCustomTimes, setUseCustomTimes] = useState(false);
    const [customTimes, setCustomTimes] = useState<Record<string, string>>({});

    const [broadcastMode, setBroadcastMode] = useState(false); // If true, immediate post

    // Dynamic platforms state
    const [platforms, setPlatforms] = useState<{ id: string, name: string, icon: any, color: string }[]>([
        { id: "linkedin", name: "LinkedIn", icon: Linkedin, color: "text-blue-600" },
        { id: "twitter", name: "Twitter", icon: Twitter, color: "text-sky-400" },
        { id: "instagram", name: "Instagram", icon: Instagram, color: "text-pink-500" },
        { id: "facebook", name: "Facebook", icon: Facebook, color: "text-blue-600" },
        { id: "youtube", name: "YouTube", icon: Youtube, color: "text-red-600" },
    ]);

    useEffect(() => {
        const saved = localStorage.getItem('social_accounts');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // Filter connected accounts and map to platform structure
                const connected = parsed
                    .filter((acc: any) => acc.connected)
                    .map((acc: any) => ({
                        id: acc.id, // Use unique account ID
                        name: acc.platform, // Or acc.name if users prefer "My Brand Page"
                        icon: getIconComponent(acc.platform),
                        color: acc.color || "text-gray-400"
                    }));

                if (connected.length > 0) {
                    setPlatforms(connected);
                }
            } catch (e) {
                console.error("Failed to load platforms", e);
            }
        }
    }, []);

    const getIconComponent = (platformName: string) => {
        const p = platformName.toLowerCase();
        if (p.includes("facebook")) return Facebook;
        if (p.includes("instagram")) return Instagram;
        if (p.includes("twitter")) return Twitter;
        if (p.includes("linkedin")) return Linkedin;
        if (p.includes("youtube")) return Youtube;
        if (p.includes("tiktok")) return MessageCircle;
        return Globe; // Default
    };

    if (!mounted) return null;

    if (!isAuthenticated) {
        router.push("/login");
        return null;
    }

    const getPlatformIcon = (platformId: string) => {
        // Try to find in dynamic platforms first
        const platform = platforms.find(p => p.id === platformId);
        if (platform) {
            const Icon = platform.icon;
            // Check if color is a full class string or just text color
            // For older accounts it might be "text-blue-600", for new ones it might be "text-blue-600 bg-blue-600/10"
            // We just want text color here usually, but let's pass it all
            return <Icon className={`w-5 h-5 ${platform.color.split(' ')[0]}`} />;
        }

        // Fallback or if using generic IDs
        return <Send className="w-5 h-5" />;
    };

    const handleSchedule = () => {
        if (!newPost.title || !newPost.content || newPost.platforms.length === 0) {
            toast.error("Please fill in title, content and select at least one platform");
            return;
        }

        if (!broadcastMode && !useCustomTimes && !newPost.scheduledFor) {
            toast.error("Please select a date and time for scheduling");
            return;
        }

        const newPosts: ScheduledPost[] = [];

        if (broadcastMode) {
            // Create one post entry with all platforms for broadcast history (or separate them - let's separate for consistency)
            // Actually, for broadcast, typically they all go out at once. But to keep data structure simple:
            const post: ScheduledPost = {
                id: Date.now().toString(),
                title: newPost.title,
                content: newPost.content,
                platforms: newPost.platforms,
                scheduledFor: new Date(),
                status: "published",
            };
            newPosts.push(post);
        } else if (useCustomTimes) {
            // Create separate posts for each platform with its own time
            newPost.platforms.forEach((platformId, index) => {
                const time = customTimes[platformId] || newPost.scheduledFor;
                if (!time) return; // Skip if no time set (should actally validate)

                newPosts.push({
                    id: (Date.now() + index).toString(),
                    title: `${newPost.title} (${platforms.find(p => p.id === platformId)?.name})`,
                    content: newPost.content,
                    platforms: [platformId],
                    scheduledFor: new Date(time),
                    status: "scheduled",
                });
            });
        } else {
            // Single schedule time for all
            const post: ScheduledPost = {
                id: Date.now().toString(),
                title: newPost.title,
                content: newPost.content,
                platforms: newPost.platforms,
                scheduledFor: new Date(newPost.scheduledFor),
                status: "scheduled",
            };
            newPosts.push(post);
        }

        if (broadcastMode) {
            toast.success(`Broadcasting to ${newPost.platforms.length} platforms...`);
            setTimeout(() => {
                toast.success("Broadcast successful!");
                setScheduledPosts([...scheduledPosts, ...newPosts]);
            }, 1500);
        } else {
            setScheduledPosts([...scheduledPosts, ...newPosts]);
            toast.success(`Scheduled ${newPosts.length} post(s) successfully!`);
        }

        setShowScheduleModal(false);
        setNewPost({ title: "", content: "", platforms: [], scheduledFor: "" });
        setBroadcastMode(false);
        setUseCustomTimes(false);
        setCustomTimes({});
    };

    const togglePlatform = (platformId: string) => {
        let updatedPlatforms;
        if (newPost.platforms.includes(platformId)) {
            updatedPlatforms = newPost.platforms.filter(p => p !== platformId);
        } else {
            updatedPlatforms = [...newPost.platforms, platformId];
        }
        setNewPost({ ...newPost, platforms: updatedPlatforms });

        // Initialize custom time for this platform if needed
        if (!customTimes[platformId]) {
            setCustomTimes(prev => ({ ...prev, [platformId]: newPost.scheduledFor }));
        }
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
            <TopNav sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} user={user} />

            <div className="flex pt-16">
                <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} user={user} logout={logout} />

                <main className="flex-1 p-6 lg:p-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-4xl font-bold text-white mb-2">Content Calendar</h1>
                            <p className="text-gray-400">Schedule and manage your posts across platforms</p>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    setBroadcastMode(true);
                                    setShowScheduleModal(true);
                                }}
                                className="px-4 py-2 bg-gradient-to-r from-pink-600 to-red-600 text-white rounded-lg hover:shadow-lg hover:shadow-pink-500/50 transition flex items-center gap-2"
                            >
                                <Send className="w-4 h-4" />
                                Broadcast Now
                            </button>
                            <button
                                onClick={() => {
                                    setBroadcastMode(false);
                                    setUseCustomTimes(false);
                                    setShowScheduleModal(true);
                                }}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Schedule Post
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between mb-8">
                        {/* View Toggles can go here if needed, keeping it simple for now */}
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
                                                    {/* Platforms Icons Stack */}
                                                    <div className="flex -space-x-2">
                                                        {post.platforms.map((pid, idx) => (
                                                            <div key={pid} className={`w-10 h-10 rounded-full border-2 border-slate-800 flex items-center justify-center bg-slate-700 z-${10 - idx}`}>
                                                                {getPlatformIcon(pid)}
                                                            </div>
                                                        ))}
                                                    </div>

                                                    <div className="flex-1 ml-4">
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
                                                            <span className="capitalize">{post.platforms.length} platforms</span>
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
                </main>
            </div>

            {/* Schedule/Broadcast Modal */}
            {showScheduleModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900 border border-white/20 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold text-white mb-6">
                            {broadcastMode ? "Broadcast to Multiple Platforms" : "Schedule New Post"}
                        </h2>

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
                                    Select Platforms
                                </label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {platforms.map(platform => (
                                        <button
                                            key={platform.id}
                                            onClick={() => togglePlatform(platform.id)}
                                            className={`flex items-center gap-2 p-3 rounded-xl border transition ${newPost.platforms.includes(platform.id)
                                                ? 'bg-purple-600/20 border-purple-500 text-white'
                                                : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                                                }`}
                                        >
                                            {getPlatformIcon(platform.id)}
                                            <span className="text-sm font-medium">{platform.name}</span>
                                            {newPost.platforms.includes(platform.id) && (
                                                <Check className="w-4 h-4 ml-auto text-purple-400" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {!broadcastMode && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <label className="block text-sm font-medium text-gray-300">
                                            Schedule For
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                id="useCustomTimes"
                                                checked={useCustomTimes}
                                                onChange={(e) => setUseCustomTimes(e.target.checked)}
                                                className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-purple-600 focus:ring-purple-500"
                                            />
                                            <label htmlFor="useCustomTimes" className="text-sm text-gray-400">
                                                Customize per platform
                                            </label>
                                        </div>
                                    </div>

                                    {!useCustomTimes ? (
                                        <input
                                            type="datetime-local"
                                            value={newPost.scheduledFor}
                                            onChange={(e) => setNewPost({ ...newPost, scheduledFor: e.target.value })}
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                    ) : (
                                        <div className="space-y-3 pl-4 border-l-2 border-white/10">
                                            {newPost.platforms.length === 0 && (
                                                <p className="text-sm text-gray-500 italic">Select platforms to customize times</p>
                                            )}
                                            {newPost.platforms.map(platformId => (
                                                <div key={platformId} className="flex items-center gap-4">
                                                    <div className="w-32 flex items-center gap-2 text-sm text-gray-300">
                                                        {getPlatformIcon(platformId)}
                                                        <span>{platforms.find(p => p.id === platformId)?.name}</span>
                                                    </div>
                                                    <input
                                                        type="datetime-local"
                                                        value={customTimes[platformId] || newPost.scheduledFor}
                                                        onChange={(e) => setCustomTimes({ ...customTimes, [platformId]: e.target.value })}
                                                        className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
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
                                className={`flex-1 px-6 py-3 text-white rounded-xl font-semibold hover:shadow-lg transition ${broadcastMode
                                    ? "bg-gradient-to-r from-pink-600 to-red-600 hover:shadow-pink-500/50"
                                    : "bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-purple-500/50"
                                    }`}
                            >
                                {broadcastMode ? "Broadcast Now" : "Schedule Post"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
