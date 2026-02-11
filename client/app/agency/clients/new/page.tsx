"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    ArrowLeft, Camera, Building2, Mail, Globe,
    Palette, Save, Loader2
} from "lucide-react";

export default function NewClientPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        industry: "",
        website: "",
        brandColor: "#7c3aed",
    });

    if (!mounted) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulation
        setTimeout(() => {
            setLoading(false);
            router.push("/agency");
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col">
            <header className="border-b border-slate-800 p-6 bg-slate-950/50 backdrop-blur-md">
                <div className="max-w-3xl mx-auto flex items-center gap-4">
                    <Link href="/agency" className="p-2 text-slate-400 hover:text-white transition rounded-lg bg-slate-900 border border-slate-800">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="text-2xl font-bold text-white">Add New Client</h1>
                </div>
            </header>

            <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-12">
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Info */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-6">
                        <div className="flex items-center gap-6 mb-4">
                            <div className="w-20 h-20 bg-slate-800 rounded-2xl border-2 border-dashed border-slate-700 flex flex-col items-center justify-center text-slate-500 hover:border-purple-500 hover:text-purple-400 cursor-pointer transition">
                                <Camera className="w-6 h-6 mb-1" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">Logo</span>
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-white mb-1">Client Branding</h2>
                                <p className="text-slate-400 text-sm">Upload the client's logo for their personalized dashboard.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2 flex items-center gap-2">
                                    <Building2 className="w-4 h-4 text-slate-500" />
                                    Client Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-slate-800 border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-purple-500"
                                    placeholder="e.g. Nike India"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2 flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-slate-500" />
                                    Contact Email
                                </label>
                                <input
                                    type="email"
                                    required
                                    className="w-full bg-slate-800 border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-purple-500"
                                    placeholder="manager@client.com"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Industry</label>
                                <select
                                    className="w-full bg-slate-800 border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-purple-500"
                                    value={formData.industry}
                                    onChange={e => setFormData({ ...formData, industry: e.target.value })}
                                >
                                    <option value="">Select Industry</option>
                                    <option value="fashion">Fashion & Apparel</option>
                                    <option value="tech">Technology</option>
                                    <option value="food">Food & Beverage</option>
                                    <option value="realestate">Real Estate</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2 flex items-center gap-2">
                                    <Globe className="w-4 h-4 text-slate-500" />
                                    Website
                                </label>
                                <input
                                    type="url"
                                    className="w-full bg-slate-800 border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-purple-500"
                                    placeholder="https://client.com"
                                    value={formData.website}
                                    onChange={e => setFormData({ ...formData, website: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Brand Voice */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-6">
                        <div className="flex items-center gap-2">
                            <Palette className="w-5 h-5 text-purple-400" />
                            <h2 className="text-xl font-bold text-white">Theme & Palette</h2>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Primary Brand Color</label>
                            <div className="flex items-center gap-4">
                                <input
                                    type="color"
                                    className="w-12 h-12 rounded-lg bg-transparent border-none cursor-pointer"
                                    value={formData.brandColor}
                                    onChange={e => setFormData({ ...formData, brandColor: e.target.value })}
                                />
                                <span className="font-mono text-slate-400 uppercase">{formData.brandColor}</span>
                            </div>
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-bold hover:shadow-lg hover:shadow-purple-500/30 transition transform hover:scale-105"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                            Create Client Account
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}
