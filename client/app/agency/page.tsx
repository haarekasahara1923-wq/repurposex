"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Users, Plus, Search, Building2, MoreVertical,
    ArrowRight, Sparkles, LayoutDashboard, Settings
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function AgencyDashboard() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuth();
    const [searchQuery, setSearchQuery] = useState("");

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    if (!isAuthenticated) {
        router.push("/login");
        return null;
    }

    const clients = [
        { id: "1", name: "Nike Mumbai", industry: "Sportswear", members: 12, status: "Active", logo: "N" },
        { id: "2", name: "TechNova Solutions", industry: "Software", members: 8, status: "Active", logo: "T" },
        { id: "3", name: "Green Earth Org", industry: "Environment", members: 5, status: "Pending", logo: "G" },
    ];

    return (
        <div className="min-h-screen bg-slate-950">
            {/* Nav */}
            <nav className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-8 h-8 text-purple-400" />
                            <span className="text-xl font-bold text-white">Agency Portal</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <Link href="/dashboard" className="text-slate-400 hover:text-white transition text-sm">Main Dashboard</Link>
                            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs">A</div>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">Agency Workspace</h1>
                        <p className="text-slate-400 text-lg">Manage your clients and their content workflows</p>
                    </div>
                    <Link
                        href="/agency/clients/new"
                        className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition font-bold shadow-lg shadow-purple-500/20"
                    >
                        <Plus className="w-5 h-5" />
                        Add New Client
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                        <Users className="w-8 h-8 text-blue-400 mb-4" />
                        <p className="text-slate-400 text-sm">Total Clients</p>
                        <p className="text-3xl font-bold text-white">{clients.length}</p>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                        <LayoutDashboard className="w-8 h-8 text-purple-400 mb-4" />
                        <p className="text-slate-400 text-sm">Active Projects</p>
                        <p className="text-3xl font-bold text-white">14</p>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                        <Sparkles className="w-8 h-8 text-pink-400 mb-4" />
                        <p className="text-slate-400 text-sm">Bulk Credits Used</p>
                        <p className="text-3xl font-bold text-white">12.4K</p>
                    </div>
                </div>

                {/* Clients List */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                    <div className="p-6 border-b border-slate-800 flex items-center justify-between gap-4">
                        <h2 className="text-xl font-bold text-white">Active Clients</h2>
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Search clients..."
                                className="w-full bg-slate-800 border-none rounded-lg pl-10 pr-4 py-2 text-white text-sm focus:ring-2 focus:ring-purple-500"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-800/50 text-slate-400 text-xs font-bold uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Client</th>
                                    <th className="px-6 py-4">Industry</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Members</th>
                                    <th className="px-6 py-4"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {clients.map(client => (
                                    <tr key={client.id} className="hover:bg-slate-800/30 transition group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-purple-600/20 border border-purple-500/30 rounded-lg flex items-center justify-center text-purple-400 font-bold">
                                                    {client.logo}
                                                </div>
                                                <span className="text-white font-medium">{client.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-400 text-sm">{client.industry}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${client.status === 'Active' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'
                                                }`}>
                                                {client.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-400 text-sm">{client.members} users</td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="p-2 text-slate-500 hover:text-white transition">
                                                <MoreVertical className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* White Label Banner */}
                <div className="mt-12 bg-gradient-to-r from-indigo-900 to-purple-900 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-8 border border-white/10">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-2">Enable White-Label Portal?</h2>
                        <p className="text-slate-300">Invite clients to a custom domain with your agency branding.</p>
                    </div>
                    <button className="px-8 py-3 bg-white text-indigo-900 rounded-xl font-bold hover:bg-slate-100 transition whitespace-nowrap">
                        Upgrade to Agency Pro
                    </button>
                </div>
            </main>
        </div>
    );
}
