"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminUsers() {
    const router = useRouter();
    const [users, setUsers] = useState([]);
    const [counts, setCounts] = useState({});
    const [filter, setFilter] = useState("all");
    const [roleFilter, setRoleFilter] = useState("all");
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [changingId, setChangingId] = useState(null);

    const getToken = () =>
        typeof window !== "undefined"
            ? localStorage.getItem("admin_token")
            : null;

    const loadUsers = async () => {
        setLoading(true);
        const token = getToken();

        if (!token) {
            router.push("/admin/login");
            return;
        }

        try {
            const params = new URLSearchParams();
            if (filter !== "all") params.set("status", filter);
            if (roleFilter !== "all") params.set("role", roleFilter);
            if (search) params.set("q", search);

            const url = `/api/admin/users${params.toString() ? "?" + params.toString() : ""
                }`;

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
        const t = setTimeout(loadUsers, 250);
        return () => clearTimeout(t);
    }, [filter, roleFilter, search]);

    const handleAction = async (userId, action) => {
        const token = getToken();

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
                alert(`✅ ${json.message}`);
                loadUsers();
            } else {
                alert(`❌ ${json.error}`);
            }
        } catch (err) {
            alert(`Error: ${err.message}`);
        }
    };

    // 🆕 Role Change handler
    const handleRoleChange = async (userId, currentRole, userName) => {
        const newRole = currentRole === "admin" ? "user" : "admin";
        const label = newRole === "admin" ? "Admin" : "User";

        if (
            !confirm(
                `"${userName}" কে ${label} বানাবেন?\n\n` +
                (newRole === "admin"
                    ? "⚠️ এই user সব ডেটা অ্যাক্সেস পাবে।"
                    : "⚠️ এই user আর Admin Panel এ ঢুকতে পারবে না।")
            )
        ) {
            return;
        }

        try {
            setChangingId(userId);
            const token = getToken();

            const res = await fetch("/api/admin/change-role", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ userId, role: newRole }),
            });

            const json = await res.json();
            if (json.success) {
                alert(`✅ ${json.message}`);
                loadUsers();
            } else {
                alert(`❌ ${json.error}`);
            }
        } catch (err) {
            alert(`Error: ${err.message}`);
        } finally {
            setChangingId(null);
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

    const roleColor = (role) => {
        switch (role) {
            case "admin":
                return "bg-purple-100 text-purple-800";
            default:
                return "bg-blue-100 text-blue-800";
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

    const roleTabs = [
        { key: "all", label: "All Roles" },
        { key: "admin", label: "Admins", count: counts.admins },
        { key: "user", label: "Users", count: counts.users },
    ];

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Users</h1>
                    <p className="text-sm text-gray-500">
                        {counts.all || 0}জন user · {counts.admins || 0} admin
                    </p>
                </div>
            </div>

            {/* Status filter tabs */}
            <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
                {tabs.map((t) => (
                    <button
                        key={t.key}
                        onClick={() => setFilter(t.key)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${filter === t.key
                                ? "bg-teal-600 text-white"
                                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                            }`}
                    >
                        {t.label} ({t.count || 0})
                    </button>
                ))}
            </div>

            {/* Role filter tabs + Search */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
                <div className="flex gap-2">
                    {roleTabs.map((r) => (
                        <button
                            key={r.key}
                            onClick={() => setRoleFilter(r.key)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${roleFilter === r.key
                                    ? "bg-purple-600 text-white"
                                    : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
                                }`}
                        >
                            {r.label}
                            {r.count !== undefined ? ` (${r.count})` : ""}
                        </button>
                    ))}
                </div>

                <input
                    placeholder="Email / নাম / shop সার্চ..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 min-w-[200px] border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-500"
                />
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
                    <div className="overflow-x-auto">
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
                                        <td className="px-4 py-3 font-medium text-gray-900">
                                            {u.name || "—"}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">{u.email}</td>
                                        <td className="px-4 py-3 text-gray-600">
                                            {u.shopName || "—"}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor(
                                                    u.status
                                                )}`}
                                            >
                                                {u.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-medium ${roleColor(
                                                    u.role
                                                )}`}
                                            >
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-wrap gap-1.5">
                                                {/* Pending actions */}
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

                                                {/* Active non-admin — block */}
                                                {u.status === "active" && u.role !== "admin" && (
                                                    <button
                                                        onClick={() => handleAction(u._id, "block")}
                                                        className="bg-gray-600 text-white px-3 py-1 rounded text-xs hover:bg-gray-700"
                                                    >
                                                        Block
                                                    </button>
                                                )}

                                                {/* Rejected — approve */}
                                                {u.status === "rejected" && (
                                                    <button
                                                        onClick={() => handleAction(u._id, "approve")}
                                                        className="bg-green-600 text-white px-3 py-1 rounded text-xs"
                                                    >
                                                        Approve
                                                    </button>
                                                )}

                                                {/* Blocked — unblock */}
                                                {u.status === "blocked" && (
                                                    <button
                                                        onClick={() => handleAction(u._id, "approve")}
                                                        className="bg-green-600 text-white px-3 py-1 rounded text-xs"
                                                    >
                                                        Unblock
                                                    </button>
                                                )}

                                                {/* 🆕 Role Change button */}
                                                {u.status === "active" && (
                                                    <button
                                                        onClick={() =>
                                                            handleRoleChange(
                                                                u._id,
                                                                u.role,
                                                                u.name || u.email
                                                            )
                                                        }
                                                        disabled={changingId === u._id}
                                                        className={`px-3 py-1 rounded text-xs font-medium transition ${u.role === "admin"
                                                                ? "bg-orange-100 text-orange-700 hover:bg-orange-200 border border-orange-300"
                                                                : "bg-purple-100 text-purple-700 hover:bg-purple-200 border border-purple-300"
                                                            } disabled:opacity-50`}
                                                    >
                                                        {changingId === u._id
                                                            ? "..."
                                                            : u.role === "admin"
                                                                ? "→ Make User"
                                                                : "→ Make Admin"}
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}