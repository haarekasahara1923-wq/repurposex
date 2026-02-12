"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Video,
    Sparkles,
    Clock,
    TrendingUp,
    Building2,
    Settings,
    LogOut,
    Users,
    Share2, // For Social Media
    X,
} from "lucide-react";

interface SidebarProps {
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
    user: any;
    logout: () => void;
}

export default function Sidebar({ sidebarOpen, setSidebarOpen, user, logout }: SidebarProps) {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    const linkBaseClass = "flex items-center gap-3 px-4 py-3 rounded-lg transition";
    const activeClass = "bg-purple-600/20 text-white";
    const inactiveClass = "text-gray-400 hover:bg-white/5 hover:text-white";

    return (
        <>
            <aside
                className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:sticky top-16 h-[calc(100vh-4rem)] w-64 bg-slate-900/50 backdrop-blur-lg border-r border-white/10 transition-transform duration-300 z-40`}
            >
                <nav className="p-4 space-y-2 h-full flex flex-col">
                    <div className="lg:hidden flex justify-end mb-4">
                        <button onClick={() => setSidebarOpen(false)} className="text-gray-400">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <Link
                        href="/dashboard"
                        className={`${linkBaseClass} ${isActive('/dashboard') ? activeClass : inactiveClass}`}
                    >
                        <LayoutDashboard className="w-5 h-5" />
                        <span>Dashboard</span>
                    </Link>

                    <Link
                        href="/content"
                        className={`${linkBaseClass} ${isActive('/content') ? activeClass : inactiveClass}`}
                    >
                        <Video className="w-5 h-5" />
                        <span>Content Library</span>
                    </Link>

                    <Link
                        href="/repurpose"
                        className={`${linkBaseClass} ${isActive('/repurpose') ? activeClass : inactiveClass}`}
                    >
                        <Sparkles className="w-5 h-5" />
                        <span>Repurpose</span>
                    </Link>

                    <Link
                        href="/schedule"
                        className={`${linkBaseClass} ${isActive('/schedule') ? activeClass : inactiveClass}`}
                    >
                        <Clock className="w-5 h-5" />
                        <span>Schedule</span>
                    </Link>

                    <Link
                        href="/social-media"
                        className={`${linkBaseClass} ${isActive('/social-media') ? activeClass : inactiveClass}`}
                    >
                        <Share2 className="w-5 h-5" />
                        <span>Social Media</span>
                    </Link>

                    <Link
                        href="/analytics"
                        className={`${linkBaseClass} ${isActive('/analytics') ? activeClass : inactiveClass}`}
                    >
                        <TrendingUp className="w-5 h-5" />
                        <span>Analytics</span>
                    </Link>

                    {user?.role === 'agency' ? (
                        <Link
                            href="/agency"
                            className={`${linkBaseClass} ${isActive('/agency') ? activeClass : inactiveClass} border-t border-white/5 mt-2 pt-2`}
                        >
                            <Building2 className="w-5 h-5 text-purple-400" />
                            <span>Agency Portal</span>
                        </Link>
                    ) : (
                        <Link
                            href="/settings?tab=agency"
                            className={`${linkBaseClass} ${isActive('/settings?tab=agency') ? activeClass : inactiveClass} border-t border-white/5 mt-2 pt-2`}
                        >
                            <Users className="w-5 h-5 text-purple-400" />
                            <span>Invite Agency</span>
                        </Link>
                    )}

                    <div className="mt-auto pt-4 border-t border-white/10">
                        <Link
                            href="/settings"
                            className={`${linkBaseClass} ${isActive('/settings') ? activeClass : inactiveClass}`}
                        >
                            <Settings className="w-5 h-5" />
                            <span>Settings</span>
                        </Link>

                        <button
                            onClick={logout}
                            className={`w-full ${linkBaseClass} text-gray-400 hover:bg-white/5 hover:text-red-400`}
                        >
                            <LogOut className="w-5 h-5" />
                            <span>Logout</span>
                        </button>
                    </div>
                </nav>
            </aside>

            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </>
    );
}
