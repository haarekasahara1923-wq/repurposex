"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Facebook,
    Instagram,
    Youtube,
    Twitter,
    Linkedin,
    Plus,
    CheckCircle,
    AlertCircle,
    Share2,
    Globe,
    MessageCircle, // for Reddit/Threads approximation if needed or use specific icons if available in lucide
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/Sidebar";
import TopNav from "@/components/TopNav";
import toast from "react-hot-toast";

// Interface for Social Account
interface SocialAccount {
    id: string;
    platform: string;
    name: string;
    handle: string;
    connected: boolean;
    icon: any; // React Node
    color: string;
}

export default function SocialMediaPage() {
    const router = useRouter();
    const { user, isAuthenticated, logout } = useAuth();
    const [mounted, setMounted] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Mock connected accounts
    const initialAccounts = [
        { id: "1", platform: "Facebook Page", name: "My Brand Page", handle: "@mybrand", connected: true, icon: Facebook, color: "text-blue-600 bg-blue-600/10" },
        { id: "2", platform: "Instagram", name: "My Insta", handle: "@myinsta", connected: true, icon: Instagram, color: "text-pink-600 bg-pink-600/10" },
        { id: "3", platform: "Twitter (X)", name: "My Twitter", handle: "@mytwitter", connected: false, icon: Twitter, color: "text-sky-500 bg-sky-500/10" },
        { id: "4", platform: "LinkedIn", name: "My Profile", handle: "@mylinkedin", connected: true, icon: Linkedin, color: "text-blue-700 bg-blue-700/10" },
        { id: "5", platform: "YouTube", name: "My Channel", handle: "@mychannel", connected: false, icon: Youtube, color: "text-red-600 bg-red-600/10" },
        { id: "6", platform: "TikTok", name: "My TikTok", handle: "@mytiktok", connected: false, icon: MessageCircle, color: "text-black bg-black/10" }, // Lucide doesn't have TikTok, using MessageCircle as placeholder or similar
        { id: "7", platform: "Snapchat", name: "My Snap", handle: "@mysnap", connected: false, icon: MessageCircle, color: "text-yellow-400 bg-yellow-400/10" },
        { id: "8", platform: "Reddit", name: "My Reddit", handle: "@myreddit", connected: false, icon: MessageCircle, color: "text-orange-600 bg-orange-600/10" },
        { id: "9", platform: "Threads", name: "My Threads", handle: "@mythreads", connected: false, icon: MessageCircle, color: "text-black bg-white/10" },
    ];

    const [accounts, setAccounts] = useState(initialAccounts);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newPlatformName, setNewPlatformName] = useState("");
    const [newPlatformUrl, setNewPlatformUrl] = useState("");

    if (!mounted) return null;

    if (!isAuthenticated) {
        router.push("/login");
        return null;
    }

    const toggleConnection = (id: string) => {
        setAccounts(accounts.map(acc => {
            if (acc.id === id) {
                const newStatus = !acc.connected;
                toast.success(`${acc.platform} ${newStatus ? 'connected' : 'disconnected'} successfully`);
                return { ...acc, connected: newStatus };
            }
            return acc;
        }));
    };

    const handleAddCustomLink = () => {
        if (!newPlatformName || !newPlatformUrl) {
            toast.error("Please fill in all fields");
            return;
        }

        const newAccount = {
            id: Date.now().toString(),
            platform: newPlatformName,
            name: newPlatformName,
            handle: newPlatformUrl,
            connected: true,
            icon: Globe,
            color: "text-purple-400 bg-purple-400/10"
        };

        // Use functional state update with spread syntax to correctly append to the array
        setAccounts(prev => [...prev, newAccount]);
        setIsAddModalOpen(false);
        setNewPlatformName("");
        setNewPlatformUrl("");
        toast.success("Custom link added successfully");
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            <TopNav sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} user={user} />

            <div className="flex pt-16">
                <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} user={user} logout={logout} />

                <main className="flex-1 p-6 lg:p-8">
                    <div className="mb-8 flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">Social Media Integrations</h1>
                            <p className="text-gray-400">Connect your accounts to enable one-click broadcasting.</p>
                        </div>
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition"
                        >
                            <Plus className="w-5 h-5" />
                            Add Custom Link
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {accounts.map((account) => (
                            <div key={account.id} className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-6 hover:border-purple-500/50 transition group relative overflow-hidden">
                                <div className={`absolute top-0 right-0 p-3 ${account.connected ? 'opacity-100' : 'opacity-0'} transition-opacity`}>
                                    <div className="bg-green-500/20 p-1 rounded-full">
                                        <CheckCircle className="w-4 h-4 text-green-400" />
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 mb-4">
                                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${account.color}`}>
                                        <account.icon className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">{account.platform}</h3>
                                        <p className="text-sm text-gray-400">{account.handle}</p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mt-4">
                                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${account.connected ? 'bg-green-500/10 text-green-400' : 'bg-gray-500/10 text-gray-400'}`}>
                                        {account.connected ? 'Connected' : 'Not Connected'}
                                    </span>

                                    <button
                                        onClick={() => toggleConnection(account.id)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${account.connected
                                                ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                                                : 'bg-white/10 text-white hover:bg-white/20'
                                            }`}
                                    >
                                        {account.connected ? 'Disconnect' : 'Connect'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </main>
            </div>

            {/* Add Custom Link Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-white/20 rounded-2xl p-8 max-w-md w-full">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-white">Add Custom Link</h2>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-white">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Platform Name</label>
                                <input
                                    type="text"
                                    value={newPlatformName}
                                    onChange={(e) => setNewPlatformName(e.target.value)}
                                    placeholder="e.g. My Blog"
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">URL / Handle</label>
                                <input
                                    type="text"
                                    value={newPlatformUrl}
                                    onChange={(e) => setNewPlatformUrl(e.target.value)}
                                    placeholder="https://..."
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>

                            <button
                                onClick={handleAddCustomLink}
                                className="w-full mt-4 bg-gradient-to-r from-purple-600 to-pink-600 py-3 rounded-xl text-white font-bold hover:shadow-lg hover:shadow-purple-500/50 transition"
                            >
                                Add Link
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
