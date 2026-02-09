"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Sparkles,
    User,
    CreditCard,
    Bell,
    Shield,
    Palette,
    Save,
    LogOut,
    Crown,
    CheckCircle,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

export default function SettingsPage() {
    const router = useRouter();
    const { user, logout, isAuthenticated } = useAuth();

    const [activeTab, setActiveTab] = useState("profile");
    const [profile, setProfile] = useState({
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        email: user?.email || "",
        phone: "",
        company: "",
        website: "",
    });

    const [notifications, setNotifications] = useState({
        email: true,
        push: true,
        weekly: true,
        monthly: false,
    });

    const [brandVoice, setBrandVoice] = useState({
        tone: "professional",
        industry: "technology",
        targetAudience: "professionals",
        keywords: "",
    });

    if (!isAuthenticated) {
        router.push("/login");
        return null;
    }

    const handleSaveProfile = () => {
        toast.success("Profile updated successfully!");
    };

    const handleSaveNotifications = () => {
        toast.success("Notification preferences updated!");
    };

    const handleSaveBrandVoice = () => {
        toast.success("Brand voice settings updated!");
    };

    const handleLogout = () => {
        logout();
        router.push("/");
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
                                Dashboard
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h1 className="text-4xl font-bold text-white mb-8">Settings</h1>

                <div className="grid lg:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-6 space-y-2">
                            <button
                                onClick={() => setActiveTab("profile")}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${activeTab === "profile"
                                        ? "bg-purple-600 text-white"
                                        : "text-gray-300 hover:bg-white/10"
                                    }`}
                            >
                                <User className="w-5 h-5" />
                                Profile
                            </button>

                            <button
                                onClick={() => setActiveTab("subscription")}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${activeTab === "subscription"
                                        ? "bg-purple-600 text-white"
                                        : "text-gray-300 hover:bg-white/10"
                                    }`}
                            >
                                <Crown className="w-5 h-5" />
                                Subscription
                            </button>

                            <button
                                onClick={() => setActiveTab("brandvoice")}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${activeTab === "brandvoice"
                                        ? "bg-purple-600 text-white"
                                        : "text-gray-300 hover:bg-white/10"
                                    }`}
                            >
                                <Palette className="w-5 h-5" />
                                Brand Voice
                            </button>

                            <button
                                onClick={() => setActiveTab("notifications")}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${activeTab === "notifications"
                                        ? "bg-purple-600 text-white"
                                        : "text-gray-300 hover:bg-white/10"
                                    }`}
                            >
                                <Bell className="w-5 h-5" />
                                Notifications
                            </button>

                            <button
                                onClick={() => setActiveTab("security")}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${activeTab === "security"
                                        ? "bg-purple-600 text-white"
                                        : "text-gray-300 hover:bg-white/10"
                                    }`}
                            >
                                <Shield className="w-5 h-5" />
                                Security
                            </button>

                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition mt-4"
                            >
                                <LogOut className="w-5 h-5" />
                                Logout
                            </button>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        {/* Profile Tab */}
                        {activeTab === "profile" && (
                            <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-8">
                                <h2 className="text-2xl font-bold text-white mb-6">Profile Information</h2>

                                <div className="grid md:grid-cols-2 gap-6 mb-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            First Name
                                        </label>
                                        <input
                                            type="text"
                                            value={profile.firstName}
                                            onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Last Name
                                        </label>
                                        <input
                                            type="text"
                                            value={profile.lastName}
                                            onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            value={profile.email}
                                            disabled
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-400 cursor-not-allowed"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Phone
                                        </label>
                                        <input
                                            type="tel"
                                            value={profile.phone}
                                            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                            placeholder="+1 (555) 123-4567"
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Company
                                        </label>
                                        <input
                                            type="text"
                                            value={profile.company}
                                            onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                                            placeholder="Your company name"
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Website
                                        </label>
                                        <input
                                            type="url"
                                            value={profile.website}
                                            onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                                            placeholder="https://yourwebsite.com"
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={handleSaveProfile}
                                    className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition flex items-center justify-center gap-2"
                                >
                                    <Save className="w-5 h-5" />
                                    Save Changes
                                </button>
                            </div>
                        )}

                        {/* Subscription Tab */}
                        {activeTab === "subscription" && (
                            <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-8">
                                <h2 className="text-2xl font-bold text-white mb-6">Subscription</h2>

                                <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/50 rounded-xl p-6 mb-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <Crown className="w-6 h-6 text-yellow-400" />
                                                <h3 className="text-xl font-bold text-white">Creator Plan</h3>
                                            </div>
                                            <p className="text-gray-300">Free Trial - 14 days remaining</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-3xl font-bold text-white">$0</div>
                                            <div className="text-sm text-gray-400">per month</div>
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4 mb-6">
                                        <div className="flex items-start gap-2 text-gray-200">
                                            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                                            <span>50 content pieces/month</span>
                                        </div>
                                        <div className="flex items-start gap-2 text-gray-200">
                                            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                                            <span>5,000 AI credits</span>
                                        </div>
                                        <div className="flex items-start gap-2 text-gray-200">
                                            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                                            <span>Video up to 2GB</span>
                                        </div>
                                        <div className="flex items-start gap-2 text-gray-200">
                                            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                                            <span>All repurposing formats</span>
                                        </div>
                                    </div>

                                    <button className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition">
                                        Upgrade to Pro
                                    </button>
                                </div>

                                <div className="bg-white/5 rounded-xl p-6">
                                    <h3 className="text-lg font-semibold text-white mb-4">Usage This Month</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex justify-between text-sm mb-2">
                                                <span className="text-gray-300">Content Pieces</span>
                                                <span className="text-white font-medium">12 / 50</span>
                                            </div>
                                            <div className="w-full bg-white/10 rounded-full h-2">
                                                <div className="bg-purple-500 h-full rounded-full" style={{ width: "24%" }} />
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex justify-between text-sm mb-2">
                                                <span className="text-gray-300">AI Credits</span>
                                                <span className="text-white font-medium">2,340 / 5,000</span>
                                            </div>
                                            <div className="w-full bg-white/10 rounded-full h-2">
                                                <div className="bg-pink-500 h-full rounded-full" style={{ width: "47%" }} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Brand Voice Tab */}
                        {activeTab === "brandvoice" && (
                            <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-8">
                                <h2 className="text-2xl font-bold text-white mb-6">Brand Voice Settings</h2>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Default Tone
                                        </label>
                                        <select
                                            value={brandVoice.tone}
                                            onChange={(e) => setBrandVoice({ ...brandVoice, tone: e.target.value })}
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        >
                                            <option value="professional">Professional</option>
                                            <option value="casual">Casual</option>
                                            <option value="viral">Viral</option>
                                            <option value="hinglish">Hinglish</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Industry
                                        </label>
                                        <input
                                            type="text"
                                            value={brandVoice.industry}
                                            onChange={(e) => setBrandVoice({ ...brandVoice, industry: e.target.value })}
                                            placeholder="e.g., Technology, Marketing, Finance"
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Target Audience
                                        </label>
                                        <input
                                            type="text"
                                            value={brandVoice.targetAudience}
                                            onChange={(e) =>
                                                setBrandVoice({ ...brandVoice, targetAudience: e.target.value })
                                            }
                                            placeholder="e.g., Professionals, Students, Entrepreneurs"
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Brand Keywords
                                        </label>
                                        <textarea
                                            value={brandVoice.keywords}
                                            onChange={(e) => setBrandVoice({ ...brandVoice, keywords: e.target.value })}
                                            placeholder="innovation, AI, automation, productivity (comma-separated)"
                                            rows={3}
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={handleSaveBrandVoice}
                                    className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition flex items-center justify-center gap-2 mt-6"
                                >
                                    <Save className="w-5 h-5" />
                                    Save Brand Voice
                                </button>
                            </div>
                        )}

                        {/* Notifications Tab */}
                        {activeTab === "notifications" && (
                            <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-8">
                                <h2 className="text-2xl font-bold text-white mb-6">Notification Preferences</h2>

                                <div className="space-y-6">
                                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                                        <div>
                                            <div className="font-semibold text-white mb-1">Email Notifications</div>
                                            <div className="text-sm text-gray-400">
                                                Receive updates and alerts via email
                                            </div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={notifications.email}
                                                onChange={(e) =>
                                                    setNotifications({ ...notifications, email: e.target.checked })
                                                }
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                                        <div>
                                            <div className="font-semibold text-white mb-1">Push Notifications</div>
                                            <div className="text-sm text-gray-400">
                                                Get instant updates in your browser
                                            </div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={notifications.push}
                                                onChange={(e) =>
                                                    setNotifications({ ...notifications, push: e.target.checked })
                                                }
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                                        <div>
                                            <div className="font-semibold text-white mb-1">Weekly Summary</div>
                                            <div className="text-sm text-gray-400">
                                                Get a weekly report of your content performance
                                            </div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={notifications.weekly}
                                                onChange={(e) =>
                                                    setNotifications({ ...notifications, weekly: e.target.checked })
                                                }
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                                        <div>
                                            <div className="font-semibold text-white mb-1">Monthly Report</div>
                                            <div className="text-sm text-gray-400">
                                                Detailed monthly analytics and insights
                                            </div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={notifications.monthly}
                                                onChange={(e) =>
                                                    setNotifications({ ...notifications, monthly: e.target.checked })
                                                }
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                                        </label>
                                    </div>
                                </div>

                                <button
                                    onClick={handleSaveNotifications}
                                    className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition flex items-center justify-center gap-2 mt-6"
                                >
                                    <Save className="w-5 h-5" />
                                    Save Preferences
                                </button>
                            </div>
                        )}

                        {/* Security Tab */}
                        {activeTab === "security" && (
                            <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-8">
                                <h2 className="text-2xl font-bold text-white mb-6">Security Settings</h2>

                                <div className="space-y-4">
                                    <div className="bg-white/5 rounded-xl p-6">
                                        <h3 className="text-lg font-semibold text-white mb-2">Change Password</h3>
                                        <p className="text-gray-400 text-sm mb-4">
                                            Update your password to keep your account secure
                                        </p>
                                        <button className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition">
                                            Change Password
                                        </button>
                                    </div>

                                    <div className="bg-white/5 rounded-xl p-6">
                                        <h3 className="text-lg font-semibold text-white mb-2">
                                            Two-Factor Authentication
                                        </h3>
                                        <p className="text-gray-400 text-sm mb-4">
                                            Add an extra layer of security to your account
                                        </p>
                                        <button className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition">
                                            Enable 2FA
                                        </button>
                                    </div>

                                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
                                        <h3 className="text-lg font-semibold text-red-300 mb-2">Delete Account</h3>
                                        <p className="text-red-400/80 text-sm mb-4">
                                            Permanently delete your account and all associated data
                                        </p>
                                        <button className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition">
                                            Delete Account
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
