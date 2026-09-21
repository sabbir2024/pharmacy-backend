"use client";

import { useEffect, useState } from "react";

export default function AdminSync() {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("admin_token");
        fetch("/api/admin/stats", {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((r) => r.json())
            .then((d) => d.success && setStats(d))
            .catch(console.error);
    }, []);

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-5">Sync Status</h1>

            <div className="bg-white rounded-xl p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="font-medium text-green-700">
                        MongoDB Connected
                    </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Stat label="Medicines" value={stats?.medicines?.total ?? "—"} />
                    <Stat label="Sales" value={stats?.sales?.total ?? "—"} />
                    <Stat label="Customers" value={stats?.customers?.total ?? "—"} />
                    <Stat label="Users" value={stats?.users?.total ?? "—"} />
                </div>
            </div>
        </div>
    );
}

function Stat({ label, value }) {
    return (
        <div className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="text-xs text-gray-500">{label}</div>
            <div className="text-xl font-bold text-gray-900 mt-1">{value}</div>
        </div>
    );
}