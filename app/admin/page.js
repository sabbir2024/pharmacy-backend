"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("admin_token");
        fetch("/api/admin/stats", {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((r) => r.json())
            .then((d) => d.success && setStats(d))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <div className="p-8 text-gray-500">Loading...</div>;
    }

    const cards = [
        {
            label: "Users",
            value: stats?.users?.total ?? 0,
            sub: `${stats?.users?.pending ?? 0} pending`,
            href: "/admin/users",
            color: "bg-teal-500",
            icon: "👥",
        },
        {
            label: "Medicines",
            value: stats?.medicines?.total ?? 0,
            sub: `${stats?.medicines?.lowStock ?? 0} low stock`,
            href: "/admin/products",
            color: "bg-blue-500",
            icon: "💊",
        },
        {
            label: "Sales",
            value: stats?.sales?.total ?? 0,
            sub: `৳ ${stats?.sales?.revenue ?? 0}`,
            href: "/admin/sales",
            color: "bg-purple-500",
            icon: "🛒",
        },
        {
            label: "Due Customers",
            value: stats?.customers?.total ?? 0,
            sub: `৳ ${stats?.customers?.totalDue ?? 0} due`,
            href: "/admin/customers",
            color: "bg-orange-500",
            icon: "🧾",
        },
    ];

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-sm text-gray-500 mt-1">
                    সব ডেটার সংক্ষিপ্ত চিত্র
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {cards.map((c) => (
                    <Link
                        key={c.label}
                        href={c.href}
                        className="bg-white rounded-xl p-5 border border-gray-100 hover:shadow-md transition-shadow"
                    >
                        <div
                            className={`w-10 h-10 rounded-full ${c.color} text-white flex items-center justify-center text-xl mb-3`}
                        >
                            {c.icon}
                        </div>
                        <div className="text-sm text-gray-500">{c.label}</div>
                        <div className="text-2xl font-bold text-gray-900 mt-1">
                            {c.value}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">{c.sub}</div>
                    </Link>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="mt-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">
                    Quick Actions
                </h2>
                <div className="flex flex-wrap gap-3">
                    <Link
                        href="/admin/products"
                        className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm hover:bg-teal-700"
                    >
                        + নতুন ঔষধ
                    </Link>
                    <Link
                        href="/admin/users"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                    >
                        Pending Users দেখুন
                    </Link>
                    <Link
                        href="/admin/customers"
                        className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm hover:bg-orange-700"
                    >
                        বাকি কাস্টমার
                    </Link>
                </div>
            </div>
        </div>
    );
}