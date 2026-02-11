"use client";

import Link from "next/link";
import {
    Sparkles, Upload, Video, FileText, BarChart, Settings,
    LogOut, Menu, X, Plus, TrendingUp, Clock, CheckCircle, Building2
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function DashboardPage() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const { logout } = useAuth();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Top Navigation */}
            <nav className="fixed top-0 w-full bg-white/5 backdrop-blur-lg border-b border-white/10 z-50">
                <div className="px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="lg:hidden text-white p-2 hover:bg-white/10 rounded-lg transition"
                            >
                                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </button>
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-8 h-8 text-purple-400" />
                                <span className="text-xl font-bold text-white">RepurposeX</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <Link
                                href="/upload"
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition"
                            >
                                <Plus className="w-4 h-4" />
                                <span className="hidden sm:inline">New Content</span>
                            </Link>

                            <button className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                                JD
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="flex pt-16">
                {/* Sidebar */}
                <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:sticky top-16 h-[calc(100vh-4rem)] w-64 bg-white/5 backdrop-blur-lg border-r border-white/10 transition-transform duration-300 z-40`}>
                    <nav className="p-4 space-y-2">
                        <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 bg-purple-600/20 text-white rounded-lg transition">
                            <BarChart className="w-5 h-5" />
                            <span>Dashboard</span>
                        </Link>

                        <Link href="/content" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-white/5 hover:text-white rounded-lg transition">
                            <Video className="w-5 h-5" />
                            <span>Content Library</span>
                        </Link>

                        <Link href="/repurpose" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-white/5 hover:text-white rounded-lg transition">
                            <Sparkles className="w-5 h-5" />
                            <span>Repurpose</span>
                        </Link>

                        <Link href="/schedule" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-white/5 hover:text-white rounded-lg transition">
                            <Clock className="w-5 h-5" />
                            <span>Schedule</span>
                        </Link>

                        <Link href="/analytics" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-white/5 hover:text-white rounded-lg transition">
                            <TrendingUp className="w-5 h-5" />
                            <span>Analytics</span>
                        </Link>

                        <Link href="/agency" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-white/5 hover:text-white rounded-lg transition border-t border-white/5 mt-2 pt-2">
                            <Building2 className="w-5 h-5 text-purple-400" />
                            <span>Agency Portal</span>
                        </Link>

                        <div className="pt-4 mt-4 border-t border-white/10">
                            <Link href="/settings" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-white/5 hover:text-white rounded-lg transition">
                                <Settings className="w-5 h-5" />
                                <span>Settings</span>
                            </Link>

                            <button
                                onClick={logout}
                                className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-white/5 hover:text-red-400 rounded-lg transition w-full"
                            >
                                <LogOut className="w-5 h-5" />
                                <span>Logout</span>
                            </button>
                        </div>
                    </nav>
                </aside>

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
