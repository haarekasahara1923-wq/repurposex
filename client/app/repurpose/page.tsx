"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RepurposeRedirect() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to content library so the user can select what to repurpose
        router.push("/content");
    }, [router]);

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-400">Loading Content Library...</p>
            </div>
        </div>
    );
}
