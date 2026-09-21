"use client";

import { useEffect, useState } from "react";

export default function AdminCustomers() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [editing, setEditing] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [saving, setSaving] = useState(false);

    const token = () =>
        typeof window !== "undefined"
            ? localStorage.getItem("admin_token")
            : null;

    const load = async () => {
        setLoading(true);
        try {
            const res = await fetch(
                `/api/admin/customers?q=${encodeURIComponent(search)}`,
                { headers: { Authorization: `Bearer ${token()}` } }
            );
            const json = await res.json();
            if (json.success) setCustomers(json.customers);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const t = setTimeout(load, 300);
        return () => clearTimeout(t);
    }, [search]);

    const save = async () => {
        setSaving(true);
        try {
            const isNew = !editing._id;
            const url = isNew
                ? "/api/admin/customers"
                : `/api/admin/customers/${editing._id}`;

            const res = await fetch(url, {
                method: isNew ? "POST" : "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token()}`,
                },
                body: JSON.stringify(editing),
            });
            const json = await res.json();
            if (json.success) {
                setShowModal(false);
                load();
            } else alert("❌ " + json.error);
        } finally {
            setSaving(false);
        }
    };

    const remove = async (id, name) => {
        if (!confirm(`"${name}" মুছে ফেলবেন?`)) return;
        const res = await fetch(`/api/admin/customers/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token()}` },
        });
        const json = await res.json();
        if (json.success) load();
        else alert("❌ " + json.error);
    };

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Due Customers
                    </h1>
                    <p className="text-sm text-gray-500">
                        {customers.length}জন কাস্টমার
                    </p>
                </div>
                <button
                    onClick={() => {
                        setEditing({
                            name: "",
                            phone: "",
                            address: "",
                            totalDue: 0,
                        });
                        setShowModal(true);
                    }}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700"
                >
                    + নতুন কাস্টমার
                </button>
            </div>

            <input
                placeholder="নাম / ফোন সার্চ..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-4 focus:outline-none focus:border-teal-500"
            />

            {loading ? (
                <div className="text-center py-16 text-gray-500">Loading...</div>
            ) : customers.length === 0 ? (
                <div className="text-center py-16 text-gray-500">
                    কোনো কাস্টমার নেই
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-gray-700">
                                <tr>
                                    <th className="text-left px-4 py-3">Name</th>
                                    <th className="text-left px-4 py-3">Phone</th>
                                    <th className="text-left px-4 py-3">Address</th>
                                    <th className="text-right px-4 py-3">Total Due</th>
                                    <th className="text-right px-4 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {customers.map((c) => (
                                    <tr key={c._id} className="border-t border-gray-100">
                                        <td className="px-4 py-3 font-medium text-gray-900">
                                            {c.name}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">
                                            {c.phone || "—"}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">
                                            {c.address || "—"}
                                        </td>
                                        <td
                                            className={`px-4 py-3 text-right font-medium ${c.totalDue > 0
                                                    ? "text-red-600"
                                                    : "text-green-600"
                                                }`}
                                        >
                                            ৳ {c.totalDue}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button
                                                onClick={() => {
                                                    setEditing({ ...c });
                                                    setShowModal(true);
                                                }}
                                                className="text-blue-600 hover:underline mr-3"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => remove(c._id, c.name)}
                                                className="text-red-600 hover:underline"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {showModal && editing && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6">
                        <h2 className="text-lg font-bold mb-4">
                            {editing._id ? "এডিট কাস্টমার" : "নতুন কাস্টমার"}
                        </h2>

                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                    নাম *
                                </label>
                                <input
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                    value={editing.name}
                                    onChange={(e) =>
                                        setEditing({ ...editing, name: e.target.value })
                                    }
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                    ফোন
                                </label>
                                <input
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                    value={editing.phone}
                                    onChange={(e) =>
                                        setEditing({ ...editing, phone: e.target.value })
                                    }
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                    ঠিকানা
                                </label>
                                <input
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                    value={editing.address}
                                    onChange={(e) =>
                                        setEditing({ ...editing, address: e.target.value })
                                    }
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                    মোট বাকি
                                </label>
                                <input
                                    type="number"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                    value={editing.totalDue}
                                    onChange={(e) =>
                                        setEditing({ ...editing, totalDue: e.target.value })
                                    }
                                />
                            </div>
                        </div>

                        <div className="flex gap-2 mt-5">
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 py-2.5 rounded-lg bg-gray-100 text-gray-700 font-medium"
                            >
                                বাতিল
                            </button>
                            <button
                                onClick={save}
                                disabled={saving}
                                className="flex-1 py-2.5 rounded-lg bg-orange-600 text-white font-medium disabled:opacity-50"
                            >
                                {saving ? "সেভ হচ্ছে..." : "সেভ"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}