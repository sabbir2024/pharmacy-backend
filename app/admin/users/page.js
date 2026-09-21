"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminUsers() {
    const router = useRouter();
    const [users, setUsers] = useState([]);
    const [counts, setCounts] = useState({});
    const [filter, setFilter] = useState("all");
    const [loading, setLoading] = useState(true);

    const loadUsers = async () => {
        setLoading(true);
        const token = localStorage.getItem("admin_token");

        if (!token) {
            router.push("/admin/login");
            return;
        }

        try {
            const url =
                filter === "all"
                    ? "/api/admin/users"
                    : `/api/admin/users?status=${filter}`;

            const res = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.status === 401 || res.status === 403) {
                localStorage.removeItem("admin_token");
                router.push("/admin/login");
                return;
            }

            const json = await res.json();
            if (json.success) {
                setUsers(json.users);
                setCounts(json.counts);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, [filter]);

    const handleAction = async (userId, action) => {
        const token = localStorage.getItem("admin_token");

        let body = { userId };
        if (action === "reject") {
            const reason = prompt("Rejection reason:");
            body.reason = reason || "Admin rejected";
        }

        try {
            const res = await fetch(`/api/admin/${action}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            });

            const json = await res.json();
            if (json.success) {
                alert(`✅ Success: ${json.message}`);
                loadUsers();
            } else {
                alert(`❌ Error: ${json.error}`);
            }
        } catch (err) {
            alert(`Error: ${err.message}`);
        }
    };

    const statusColor = (status) => {
        switch (status) {
            case "pending":
                return "bg-yellow-100 text-yellow-800";
            case "active":
                return "bg-green-100 text-green-800";
            case "rejected":
                return "bg-red-100 text-red-800";
            case "blocked":
                return "bg-gray-100 text-gray-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const logout = () => {
        localStorage.removeItem("admin_token");
        router.push("/admin/login");
    };

    const tabs = [
        { key: "all", label: "All", count: counts.all },
        { key: "pending", label: "Pending", count: counts.pending },
        { key: "active", label: "Active", count: counts.active },
        { key: "rejected", label: "Rejected", count: counts.rejected },
        { key: "blocked", label: "Blocked", count: counts.blocked },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-bold text-teal-700">
                        Admin Panel
                    </h1>
                    <p className="text-xs text-gray-500">User Management</p>
                </div>
                <button
                    onClick={logout}
                    className="text-sm text-red-600 hover:underline"
                >
                    Logout
                </button>
            </header>

            <main className="p-6 max-w-6xl mx-auto">
                {/* Filter Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto">
                    {tabs.map((t) => (
                        <button
                            key={t.key}
                            onClick={() => setFilter(t.key)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${filter === t.key
                                    ? "bg-teal-600 text-white"
                                    : "bg-white text-gray-700 border border-gray-300"
                                }`}
                        >
                            {t.label} ({t.count || 0})
                        </button>
                    ))}
                </div>

                {/* Users Table */}
                {loading ? (
                    <div className="text-center py-20 text-gray-500">Loading...</div>
                ) : users.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">
                        কোনো user নেই
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-gray-700">
                                <tr>
                                    <th className="text-left px-4 py-3">Name</th>
                                    <th className="text-left px-4 py-3">Email</th>
                                    <th className="text-left px-4 py-3">Shop</th>
                                    <th className="text-left px-4 py-3">Status</th>
                                    <th className="text-left px-4 py-3">Role</th>
                                    <th className="text-left px-4 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((u) => (
                                    <tr key={u._id} className="border-t border-gray-100">
                                        <td className="px-4 py-3">{u.name || "—"}</td>
                                        <td className="px-4 py-3">{u.email}</td>
                                        <td className="px-4 py-3">{u.shopName || "—"}</td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor(
                                                    u.status
                                                )}`}
                                            >
                                                {u.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-600">
                                            {u.role}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-2">
                                                {u.status === "pending" && (
                                                    <>
                                                        <button
                                                            onClick={() => handleAction(u._id, "approve")}
                                                            className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleAction(u._id, "reject")}
                                                            className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700"
                                                        >
                                                            Reject
                                                        </button>
                                                    </>
                                                )}
                                                {u.status === "active" && u.role !== "admin" && (
                                                    <button
                                                        onClick={() => handleAction(u._id, "block")}
                                                        className="bg-gray-600 text-white px-3 py-1 rounded text-xs hover:bg-gray-700"
                                                    >
                                                        Block
                                                    </button>
                                                )}
                                                {u.status === "rejected" && (
                                                    <button
                                                        onClick={() => handleAction(u._id, "approve")}
                                                        className="bg-green-600 text-white px-3 py-1 rounded text-xs"
                                                    >
                                                        Approve
                                                    </button>
                                                )}
                                                {u.status === "blocked" && (
                                                    <button
                                                        onClick={() => handleAction(u._id, "approve")}
                                                        className="bg-green-600 text-white px-3 py-1 rounded text-xs"
                                                    >
                                                        Unblock
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>
        </div>
    );
}