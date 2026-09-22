"use client";

import { useEffect, useState } from "react";

export default function AdminSync() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [clearing, setClearing] = useState(false);

    const load = () => {
        const token = localStorage.getItem("admin_token");
        fetch("/api/admin/stats", {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((r) => r.json())
            .then((d) => d.success && setStats(d))
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(load, []);

    const clearMongoDB = async () => {
        const confirmText = prompt(
            "⚠️ MongoDB থেকে সব medicines, sales, customers মুছে যাবে।\n\n" +
            "এটা ফেরানো যাবে না!\n\n" +
            "নিশ্চিত করতে 'CLEAR' লিখুন:"
        );

        if (confirmText !== "CLEAR") {
            alert("বাতিল করা হয়েছে");
            return;
        }

        try {
            setClearing(true);
            const token = localStorage.getItem("admin_token");

            const res = await fetch("/api/admin/clear-mongodb", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    tables: ["medicines", "sales", "customers"],
                }),
            });

            const json = await res.json();
            if (json.success) {
                alert(
                    `✅ MongoDB clear হয়েছে!\n\n` +
                    `Medicines: ${json.deleted.medicines}\n` +
                    `Sales: ${json.deleted.sales}\n` +
                    `Customers: ${json.deleted.customers}`
                );
                load();
            } else {
                alert("❌ " + json.error);
            }
        } catch (err) {
            alert("Error: " + err.message);
        } finally {
            setClearing(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-gray-500">Loading...</div>;
    }

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

            {/* Danger Zone */}
            <div className="mt-6 border border-red-200 rounded-xl p-5 bg-red-50">
                <h2 className="text-lg font-bold text-red-700 mb-2">
                    ⚠️ Danger Zone
                </h2>
                <p className="text-sm text-red-600 mb-4">
                    MongoDB থেকে সব medicines, sales, customers মুছে ফেলুন।
                    Users অটুট থাকবে।
                </p>

                <button
                    onClick={clearMongoDB}
                    disabled={clearing}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                >
                    {clearing ? "মুছে ফেলা হচ্ছে..." : "🗑️ Clear MongoDB Data"}
                </button>
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