"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Sparkles,
    Video, // Kept from original for Content Library
    Upload,
    TrendingUp,
    CheckCircle,
    Clock,
    Users,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { contentAPI } from "@/lib/api";
import Sidebar from "@/components/Sidebar";
import TopNav from "@/components/TopNav";

export default function DashboardPage() {
    const router = useRouter();
    const { user, isAuthenticated, logout } = useAuth();

    const [mounted, setMounted] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    useEffect(() => {
        setMounted(true);

        if (isAuthenticated && user?.role === 'admin') {
            router.push('/admin');
        }
    }, [isAuthenticated, user, router]);

    const [stats, setStats] = useState({
        totalContent: 0,
        pendingJobs: 0,
        completedJobs: 0,
        totalReach: 0,
    });
    const [recentActivity, setRecentActivity] = useState<any[]>([]);

    if (!mounted) return null;

    const getInitials = () => {
        if (user?.role === 'agency' && user.businessName) {
            return user.businessName.substring(0, 2).toUpperCase();
        }
        return `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase() || 'UX';
    };

    const getUserName = () => {
        if (user?.role === 'agency' && user.businessName) {
            return user.businessName;
        }
        return `${user?.firstName} ${user?.lastName}`;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            <TopNav
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                user={user}
            />

            <div className="flex pt-16">
                <Sidebar
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                    user={user}
                    logout={logout}
                />

                {/* Main Content */}
                <main className="flex-1 p-6 lg:p-8">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-gray-400 text-sm font-medium">Total Content</h3>
                                <Video className="w-8 h-8 text-purple-400" />
                            </div>
                            <p className="text-3xl font-bold text-white mb-1">24</p>
                            <p className="text-sm text-green-400">+12% from last month</p>
                        </div>

                        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-gray-400 text-sm font-medium">Repurposed</h3>
                                <Sparkles className="w-8 h-8 text-pink-400" />
                            </div>
                            <p className="text-3xl font-bold text-white mb-1">156</p>
                            <p className="text-sm text-green-400">+28% from last month</p>
                        </div>

                        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-gray-400 text-sm font-medium">Total Views</h3>
                                <TrendingUp className="w-8 h-8 text-blue-400" />
                            </div>
                            <p className="text-3xl font-bold text-white mb-1">89.2K</p>
                            <p className="text-sm text-green-400">+45% from last month</p>
                        </div>

                        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-gray-400 text-sm font-medium">AI Credits</h3>
                                <Sparkles className="w-8 h-8 text-yellow-400" />
                            </div>
                            <p className="text-3xl font-bold text-white mb-1">1,245</p>
                            <p className="text-sm text-gray-400">of 2,000 remaining</p>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-white mb-4">Quick Actions</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Link href="/upload" className="group bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:border-purple-500/50 transition">
                                <Upload className="w-12 h-12 text-purple-400 mb-4 group-hover:scale-110 transition" />
                                <h3 className="text-xl font-bold text-white mb-2">Upload Content</h3>
                                <p className="text-gray-400">Upload video, audio, or text to start repurposing</p>
                            </Link>

                            <Link href="/repurpose" className="group bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:border-blue-500/50 transition">
                                <Sparkles className="w-12 h-12 text-blue-400 mb-4 group-hover:scale-110 transition" />
                                <h3 className="text-xl font-bold text-white mb-2">AI Repurpose</h3>
                                <p className="text-gray-400">Transform content into multiple formats</p>
                            </Link>

                            <Link href="/schedule" className="group bg-gradient-to-br from-green-600/20 to-blue-600/20 backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:border-green-500/50 transition">
                                <Clock className="w-12 h-12 text-green-400 mb-4 group-hover:scale-110 transition" />
                                <h3 className="text-xl font-bold text-white mb-2">Schedule Posts</h3>
                                <p className="text-gray-400">Plan and auto-publish to all platforms</p>
                            </Link>

                            {user?.role === 'agency' && (
                                <Link href="/settings?tab=agency" className="group bg-gradient-to-br from-yellow-600/20 to-orange-600/20 backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:border-yellow-500/50 transition">
                                    <Users className="w-12 h-12 text-yellow-400 mb-4 group-hover:scale-110 transition" />
                                    <h3 className="text-xl font-bold text-white mb-2">Invite Client</h3>
                                    <p className="text-gray-400">Add new clients to your agency portal</p>
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-4">Recent Activity</h2>
                        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl overflow-hidden">
                            <div className="divide-y divide-white/10">
                                <div className="p-6 hover:bg-white/5 transition">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                                            <CheckCircle className="w-6 h-6 text-green-400" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-white font-semibold">Content processed successfully</h3>
                                            <p className="text-gray-400 text-sm">My Podcast Episode #45 → 12 new pieces</p>
                                        </div>
                                        <span className="text-gray-400 text-sm">2 hours ago</span>
                                    </div>
                                </div>

                                <div className="p-6 hover:bg-white/5 transition">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                            <Upload className="w-6 h-6 text-blue-400" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-white font-semibold">New content uploaded</h3>
                                            <p className="text-gray-400 text-sm">YouTube Video - AI Marketing Tips</p>
                                        </div>
                                        <span className="text-gray-400 text-sm">5 hours ago</span>
                                    </div>
                                </div>

                                <div className="p-6 hover:bg-white/5 transition">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                            <Sparkles className="w-6 h-6 text-purple-400" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-white font-semibold">AI repurposing completed</h3>
                                            <p className="text-gray-400 text-sm">Blog Post → 8 social media posts</p>
                                        </div>
                                        <span className="text-gray-400 text-sm">1 day ago</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
