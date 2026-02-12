
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { adminAPI } from "@/lib/api";
import toast from "react-hot-toast";

interface UserData {
    id: string;
    name: string;
    email: string;
    role: string;
    businessName: string;
    plan: string;
    status: string;
    joinedAt: string;
    lastLogin: string;
}

export default function AdminDashboard() {
    const { user, isAuthenticated, loading } = useAuth();
    const router = useRouter();
    const [users, setUsers] = useState<UserData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push('/login');
            return;
        }

        if (!loading && user?.role !== 'admin') {
            toast.error('Access denied');
            router.push('/dashboard');
            return;
        }

        if (isAuthenticated && user?.role === 'admin') {
            fetchUsers();
        }
    }, [isAuthenticated, loading, user, router]);

    const fetchUsers = async () => {
        try {
            const response = await adminAPI.getUsers();
            setUsers(response.data);
        } catch (error) {
            console.error('Failed to fetch users:', error);
            toast.error('Failed to load users');
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleStatus = async (userId: string, currentStatus: string) => {
        const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
        try {
            await adminAPI.toggleStatus(userId, newStatus as 'active' | 'suspended');
            toast.success(`User ${newStatus === 'active' ? 'unblocked' : 'blocked'} successfully`);
            fetchUsers(); // Refresh list
        } catch (error) {
            console.error('Action failed:', error);
            toast.error('Action failed');
        }
    };

    const handleGrantAccess = async (userId: string) => {
        if (!confirm('Are you sure you want to mark this user as PAID and grant access? This will override payment gateways.')) {
            return;
        }

        try {
            await adminAPI.grantAccess(userId);
            toast.success('Access granted (marked as paid) successfully');
            fetchUsers();
        } catch (error) {
            console.error('Grant access failed:', error);
            toast.error('Failed to grant access');
        }
    };

    if (loading || isLoading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
                Loading Admin Panel...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900 text-white p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                    <div className="text-gray-400">
                        Logged in as: <span className="text-white font-semibold">{user?.email}</span>
                    </div>
                </div>

                <div className="bg-slate-800 rounded-xl overflow-hidden shadow-2xl border border-slate-700">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-900 text-gray-400 uppercase text-xs font-semibold">
                                <tr>
                                    <th className="px-6 py-4">User / Agency</th>
                                    <th className="px-6 py-4">Role</th>
                                    <th className="px-6 py-4">Plan Status</th>
                                    <th className="px-6 py-4">Account Status</th>
                                    <th className="px-6 py-4">Joined At</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                                {users.map((userData) => (
                                    <tr key={userData.id} className="hover:bg-slate-700/50 transition">
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="font-semibold text-white">{userData.name}</div>
                                                <div className="text-sm text-gray-400">{userData.email}</div>
                                                {userData.businessName !== 'N/A' && (
                                                    <div className="text-xs text-purple-400 mt-1">{userData.businessName}</div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-semibold ${userData.role === 'agency' ? 'bg-blue-500/20 text-blue-400' :
                                                    userData.role === 'admin' ? 'bg-red-500/20 text-red-400' :
                                                        'bg-green-500/20 text-green-400'
                                                }`}>
                                                {userData.role.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-medium text-white">{userData.plan}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-semibold ${userData.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                                }`}>
                                                {userData.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-400">
                                            {new Date(userData.joinedAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            {userData.role !== 'admin' && (
                                                <>
                                                    <button
                                                        onClick={() => handleGrantAccess(userData.id)}
                                                        className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded transition"
                                                        title="Mark Paid / Grant Access"
                                                    >
                                                        Mark Paid
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggleStatus(userData.id, userData.status)}
                                                        className={`px-3 py-1.5 text-white text-xs rounded transition ${userData.status === 'active'
                                                                ? 'bg-red-600 hover:bg-red-700'
                                                                : 'bg-green-600 hover:bg-green-700'
                                                            }`}
                                                    >
                                                        {userData.status === 'active' ? 'Block' : 'Unblock'}
                                                    </button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {users.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                                            No users found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
