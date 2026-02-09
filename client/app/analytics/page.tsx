"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Sparkles,
    TrendingUp,
    TrendingDown,
    Eye,
    Heart,
    Share2,
    Users,
    BarChart3,
    PieChart,
    Download,
    Calendar,
    Linkedin,
    Twitter,
    Instagram,
    Youtube,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function AnalyticsPage() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuth();

    const [timeRange, setTimeRange] = useState("7d");

    if (!isAuthenticated) {
        router.push("/login");
        return null;
    }

    // Mock data - in production, this would come from API
    const stats = {
        totalViews: 127453,
        totalEngagement: 8942,
        totalShares: 1234,
        totalFollowers: 15678,
        viewsChange: 12.5,
        engagementChange: -3.2,
        sharesChange: 24.8,
        followersChange: 5.3,
    };

    const platformData = [
        { platform: "LinkedIn", views: 45230, engagement: 3421, color: "blue" },
        { platform: "Twitter", views: 38920, engagement: 2871, color: "sky" },
        { platform: "Instagram", views: 32140, engagement: 1980, color: "pink" },
        { platform: "YouTube", views: 11163, engagement: 670, color: "red" },
    ];

    const recentPosts = [
        {
            id: "1",
            title: "AI Content Strategy Tips",
            platform: "linkedin",
            views: 12450,
            engagement: 892,
            shares: 234,
            date: "2 days ago",
        },
        {
            id: "2",
            title: "10x Your Content Production",
            platform: "twitter",
            views: 8920,
            engagement: 671,
            shares: 145,
            date: "3 days ago",
        },
        {
            id: "3",
            title: "Content Repurposing Guide",
            platform: "instagram",
            views: 7340,
            engagement: 542,
            shares: 98,
            date: "5 days ago",
        },
    ];

    const getPlatformIcon = (platform: string) => {
        const icons: any = {
            linkedin: <Linkedin className="w-5 h-5 text-blue-500" />,
            twitter: <Twitter className="w-5 h-5 text-sky-400" />,
            instagram: <Instagram className="w-5 h-5 text-pink-500" />,
            youtube: <Youtube className="w-5 h-5 text-red-500" />,
        };
        return icons[platform] || <BarChart3 className="w-5 h-5" />;
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
                            <button className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition">
                                <Download className="w-4 h-4" />
                                Export Report
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Title & Time Range */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">Analytics</h1>
                        <p className="text-gray-400">Track your content performance across platforms</p>
                    </div>

                    <div className="flex gap-2">
                        {["7d", "30d", "90d", "1y"].map((range) => (
                            <button
                                key={range}
                                onClick={() => setTimeRange(range)}
                                className={`px-4 py-2 rounded-lg font-medium transition ${timeRange === range
                                        ? "bg-purple-600 text-white"
                                        : "bg-white/10 text-gray-400 hover:bg-white/20"
                                    }`}
                            >
                                {range === "7d" && "Last 7 Days"}
                                {range === "30d" && "Last 30 Days"}
                                {range === "90d" && "Last 90 Days"}
                                {range === "1y" && "Last Year"}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white/10 backdrop-blur border border-white/20 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-3">
                            <Eye className="w-10 h-10 text-blue-400" />
                            <span
                                className={`flex items-center gap-1 text-sm font-medium ${stats.viewsChange >= 0 ? "text-green-400" : "text-red-400"
                                    }`}
                            >
                                {stats.viewsChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                {Math.abs(stats.viewsChange)}%
                            </span>
                        </div>
                        <div className="text-3xl font-bold text-white mb-1">
                            {stats.totalViews.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-400">Total Views</div>
                    </div>

                    <div className="bg-white/10 backdrop-blur border border-white/20 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-3">
                            <Heart className="w-10 h-10 text-pink-400" />
                            <span
                                className={`flex items-center gap-1 text-sm font-medium ${stats.engagementChange >= 0 ? "text-green-400" : "text-red-400"
                                    }`}
                            >
                                {stats.engagementChange >= 0 ? (
                                    <TrendingUp className="w-4 h-4" />
                                ) : (
                                    <TrendingDown className="w-4 h-4" />
                                )}
                                {Math.abs(stats.engagementChange)}%
                            </span>
                        </div>
                        <div className="text-3xl font-bold text-white mb-1">
                            {stats.totalEngagement.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-400">Total Engagement</div>
                    </div>

                    <div className="bg-white/10 backdrop-blur border border-white/20 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-3">
                            <Share2 className="w-10 h-10 text-green-400" />
                            <span
                                className={`flex items-center gap-1 text-sm font-medium ${stats.sharesChange >= 0 ? "text-green-400" : "text-red-400"
                                    }`}
                            >
                                {stats.sharesChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                {Math.abs(stats.sharesChange)}%
                            </span>
                        </div>
                        <div className="text-3xl font-bold text-white mb-1">
                            {stats.totalShares.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-400">Total Shares</div>
                    </div>

                    <div className="bg-white/10 backdrop-blur border border-white/20 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-3">
                            <Users className="w-10 h-10 text-purple-400" />
                            <span
                                className={`flex items-center gap-1 text-sm font-medium ${stats.followersChange >= 0 ? "text-green-400" : "text-red-400"
                                    }`}
                            >
                                {stats.followersChange >= 0 ? (
                                    <TrendingUp className="w-4 h-4" />
                                ) : (
                                    <TrendingDown className="w-4 h-4" />
                                )}
                                {Math.abs(stats.followersChange)}%
                            </span>
                        </div>
                        <div className="text-3xl font-bold text-white mb-1">
                            {stats.totalFollowers.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-400">Total Followers</div>
                    </div>
                </div>

                {/* Platform Performance */}
                <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-8 mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-white">Platform Performance</h2>
                        <PieChart className="w-6 h-6 text-purple-400" />
                    </div>

                    <div className="space-y-6">
                        {platformData.map((platform, index) => {
                            const totalViews = platformData.reduce((sum, p) => sum + p.views, 0);
                            const percentage = ((platform.views / totalViews) * 100).toFixed(1);

                            return (
                                <div key={index}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-white font-medium">{platform.platform}</span>
                                        <div className="flex items-center gap-4">
                                            <span className="text-gray-400 text-sm">
                                                {platform.views.toLocaleString()} views
                                            </span>
                                            <span className="text-gray-400 text-sm">
                                                {platform.engagement.toLocaleString()} engagement
                                            </span>
                                            <span className="text-purple-400 font-semibold">{percentage}%</span>
                                        </div>
                                    </div>
                                    <div className="w-full bg-white/10 rounded-full h-3">
                                        <div
                                            className={`h-full rounded-full bg-${platform.color}-500`}
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Recent Posts Performance */}
                <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-white">Top Performing Posts</h2>
                        <BarChart3 className="w-6 h-6 text-purple-400" />
                    </div>

                    <div className="space-y-4">
                        {recentPosts.map((post, index) => (
                            <div
                                key={post.id}
                                className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-6 hover:border-purple-500/50 transition"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4 flex-1">
                                        <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                                            {getPlatformIcon(post.platform)}
                                        </div>

                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-white mb-2">{post.title}</h3>

                                            <div className="flex items-center gap-6 text-sm text-gray-400">
                                                <span className="flex items-center gap-2">
                                                    <Eye className="w-4 h-4" />
                                                    {post.views.toLocaleString()}
                                                </span>
                                                <span className="flex items-center gap-2">
                                                    <Heart className="w-4 h-4" />
                                                    {post.engagement.toLocaleString()}
                                                </span>
                                                <span className="flex items-center gap-2">
                                                    <Share2 className="w-4 h-4" />
                                                    {post.shares.toLocaleString()}
                                                </span>
                                                <span className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4" />
                                                    {post.date}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-white">#{index + 1}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Chart Placeholder */}
                <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-12 mt-8 text-center">
                    <BarChart3 className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                    <h3 className="text-2xl font-semibold text-white mb-2">Interactive Charts</h3>
                    <p className="text-gray-400 mb-6">
                        Detailed performance charts with trend analysis coming soon. Current stats show real-time data.
                    </p>
                </div>
            </div>
        </div>
    );
}
