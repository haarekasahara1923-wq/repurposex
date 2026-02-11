"use client";

import { useState, Suspense, useEffect } from "react";
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
    Users,
    Mail,
    ChevronRight,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import toast from "react-hot-toast";
import { authAPI } from "@/lib/api";
import { useSearchParams } from "next/navigation";

function SettingsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, logout, isAuthenticated } = useAuth();

    const [activeTab, setActiveTab] = useState("profile");

    useEffect(() => {
        const tab = searchParams.get("tab");
        if (tab) setActiveTab(tab);
    }, [searchParams]);
    const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');
    const [profile, setProfile] = useState({
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        email: user?.email || "",
        phone: user?.phone || "",
        businessName: user?.businessName || "",
        whatsapp: user?.whatsapp || "",
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

    const handleSaveProfile = async () => {
        toast.loading("Updating profile...", { id: "profile" });
        try {
            await authAPI.updateProfile({
                firstName: profile.firstName,
                lastName: profile.lastName,
                phone: profile.phone,
                businessName: profile.businessName,
                whatsapp: profile.whatsapp
            });
            toast.success("Profile updated successfully!", { id: "profile" });
        } catch (error) {
            toast.error("Failed to update profile", { id: "profile" });
        }
    };

    const handleSaveNotifications = () => {
        toast.success("Notification preferences updated!");
    };

    const handleSaveBrandVoice = () => {
        toast.success("Brand voice settings updated!");
    };

    const handlePayment = async (gateway: string) => {
        toast.loading(`Initiating ${gateway} payment...`, { id: 'pay' });
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const token = localStorage.getItem('token');
            const planSlug = 'pro'; // Defaulting to pro for this button

            if (gateway === 'razorpay') {
                // Razorpay Flow
                const { data } = await axios.post(`${apiUrl}/api/v1/payments/razorpay/create`, {
                    amount: currency === 'INR' ? 2999 : 99,
                    planId: planSlug
                }, { headers: { Authorization: `Bearer ${token}` } });

                toast.success('Razorpay Order Created!', { id: 'pay' });
                // In production: open Razorpay checkout Modal
            } else if (gateway === 'stripe') {
                const origin = typeof window !== 'undefined' ? window.location.origin : '';
                const { data } = await axios.post(`${apiUrl}/api/v1/payments/stripe/create-session`, {
                    planId: planSlug,
                    successUrl: origin + '/dashboard?payment=success',
                    cancelUrl: origin + '/settings?payment=cancel'
                }, { headers: { Authorization: `Bearer ${token}` } });

                if (typeof window !== 'undefined') {
                    window.location.href = data.url;
                }
            } else {
                toast.success(`${gateway} flow initiated (Sandbox)`, { id: 'pay' });
            }
        } catch (error) {
            toast.error('Payment failed to start', { id: 'pay' });
        }
    };

    const [inviteData, setInviteData] = useState({
        email: "",
        clientName: "",
    });

    const handleInviteClient = async (e: React.FormEvent) => {
        e.preventDefault();
        toast.loading("Sending invitation...", { id: "invite" });
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const token = localStorage.getItem('token');
            const organizationId = user?.organizationId || 'org-123'; // Fallback for demo

            await axios.post(`${apiUrl}/api/v1/agency/invite-client`, {
                ...inviteData,
                organizationId
            }, { headers: { Authorization: `Bearer ${token}` } });

            toast.success(`Invite sent to ${inviteData.email}!`, { id: "invite" });
            setInviteData({ email: "", clientName: "" });
        } catch (error) {
            toast.error("Failed to send invitation", { id: "invite" });
        }
    };

    const handleLogout = () => {
        logout();
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

                            {user?.role === 'agency' && (
                                <button
                                    onClick={() => setActiveTab("agency")}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${activeTab === "agency"
                                        ? "bg-purple-600 text-white"
                                        : "text-gray-300 hover:bg-white/10"
                                        }`}
                                >
                                    <Users className="w-5 h-5" />
                                    Agency / Clients
                                </button>
                            )}

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
                                            Business Name
                                        </label>
                                        <input
                                            type="text"
                                            value={profile.businessName}
                                            onChange={(e) => setProfile({ ...profile, businessName: e.target.value })}
                                            placeholder="Your business name"
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            WhatsApp No.
                                        </label>
                                        <input
                                            type="tel"
                                            value={profile.whatsapp}
                                            onChange={(e) => setProfile({ ...profile, whatsapp: e.target.value })}
                                            placeholder="+91..."
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
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold text-white">Subscription</h2>
                                    <div className="flex items-center gap-2 bg-white/5 p-1 rounded-lg border border-white/10">
                                        <button
                                            onClick={() => setCurrency('INR')}
                                            className={`px-3 py-1 rounded-md text-xs font-bold transition ${currency === 'INR' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
                                        >
                                            INR
                                        </button>
                                        <button
                                            onClick={() => setCurrency('USD')}
                                            className={`px-3 py-1 rounded-md text-xs font-bold transition ${currency === 'USD' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
                                        >
                                            USD
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/50 rounded-xl p-6 mb-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <Crown className="w-6 h-6 text-yellow-400" />
                                                <h3 className="text-xl font-bold text-white">Pro Plan</h3>
                                            </div>
                                            <p className="text-gray-300">Active Subscription</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-3xl font-bold text-white">
                                                {currency === 'INR' ? '₹2,999' : '$99'}
                                            </div>
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
                                        {/* ... higher limits ... */}
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        {currency === 'INR' ? (
                                            <button
                                                onClick={() => handlePayment('razorpay')}
                                                className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2"
                                            >
                                                Pay with Razorpay
                                            </button>
                                        ) : (
                                            <div className="grid grid-cols-2 gap-3">
                                                <button
                                                    onClick={() => handlePayment('stripe')}
                                                    className="py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition"
                                                >
                                                    Stripe
                                                </button>
                                                <button
                                                    onClick={() => handlePayment('paypal')}
                                                    className="py-3 bg-yellow-500 text-slate-900 rounded-xl font-bold hover:bg-yellow-600 transition"
                                                >
                                                    PayPal
                                                </button>
                                            </div>
                                        )}
                                        <p className="text-xs text-center text-gray-400 mt-2">
                                            Secure, encrypted payment processing.
                                        </p>
                                    </div>
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

            {/* Agency Tab */}
            {activeTab === "agency" && (
                <div className="max-w-4xl mx-auto px-4 mt-8">
                    <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-8 mb-6">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-white">Agency Portal Settings</h2>
                                <p className="text-gray-400">Invite and manage your white-label clients</p>
                            </div>
                            <div className="bg-purple-600/20 text-purple-400 px-3 py-1 rounded-full text-xs font-medium border border-purple-500/30">
                                Agency Plan Active
                            </div>
                        </div>

                        <form onSubmit={handleInviteClient} className="max-w-xl space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Client Full Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={inviteData.clientName}
                                    onChange={(e) => setInviteData({ ...inviteData, clientName: e.target.value })}
                                    placeholder="e.g. John Doe Enterprises"
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-purple-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Client Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
                                    <input
                                        type="email"
                                        required
                                        value={inviteData.email}
                                        onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                                        placeholder="client@example.com"
                                        className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-purple-500 outline-none"
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition flex items-center justify-center gap-2"
                            >
                                Send Invitation Email
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </form>
                    </div>

                    <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-8">
                        <h3 className="text-xl font-bold text-white mb-6">Active Clients</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                                        JD
                                    </div>
                                    <div>
                                        <div className="text-white font-medium">John Doe Enterprises</div>
                                        <div className="text-xs text-gray-500">Active since Feb 10, 2026</div>
                                    </div>
                                </div>
                                <button className="text-gray-400 hover:text-white text-sm transition font-medium">
                                    View Portal
                                </button>
                            </div>
                            <div className="p-12 text-center border-2 border-dashed border-white/10 rounded-2xl">
                                <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                                <p className="text-gray-500">Looking to scale? Invite your first client to start automating their content strategy. </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function SettingsPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        }>
            <SettingsContent />
        </Suspense>
    );
}
