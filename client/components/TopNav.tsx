"use client";

import Link from "next/link";
import { Sparkles, Menu, Plus, Upload, X } from "lucide-react";

interface TopNavProps {
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
    user: any;
}

export default function TopNav({ sidebarOpen, setSidebarOpen, user }: TopNavProps) {

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
        <nav className="fixed top-0 w-full bg-slate-900/80 backdrop-blur-lg border-b border-white/10 z-50">
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="lg:hidden text-white p-2 hover:bg-white/10 rounded-lg transition"
                        >
                            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                        <Link href="/dashboard" className="flex items-center gap-2">
                            <Sparkles className="w-8 h-8 text-purple-400" />
                            <span className="text-xl font-bold text-white">RepurposeX</span>
                        </Link>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link
                            href="/upload"
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition"
                        >
                            <Plus className="w-4 h-4" />
                            <span className="hidden sm:inline">New Content</span>
                        </Link>

                        <div className="flex items-center gap-3 bg-white/5 pl-4 pr-1 py-1 rounded-full border border-white/10">
                            <span className="text-sm font-medium text-white hidden sm:inline">
                                {getUserName()}
                            </span>
                            {user?.avatarUrl ? (
                                <img src={user.avatarUrl} alt="Profile" className="w-8 h-8 rounded-full border-2 border-white/20" />
                            ) : (
                                <button className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white text-xs font-bold ring-2 ring-white/20">
                                    {getInitials()}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
