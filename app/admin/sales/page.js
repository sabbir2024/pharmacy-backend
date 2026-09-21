"use client";

import { useEffect, useState } from "react";

export default function AdminSales() {
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("admin_token");
        fetch("/api/admin/sales", {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((r) => r.json())
            .then((d) => d.success && setSales(d.sales))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <div className="p-8 text-gray-500">Loading...</div>;
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="mb-5">
                <h1 className="text-2xl font-bold text-gray-900">Sales History</h1>
                <p className="text-sm text-gray-500">{sales.length}টি বিল</p>
            </div>

            {sales.length === 0 ? (
                <div className="text-center py-16 text-gray-500">
                    কোনো বিক্রয় নেই
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-gray-700">
                                <tr>
                                    <th className="text-left px-4 py-3">Invoice</th>
                                    <th className="text-left px-4 py-3">Date</th>
                                    <th className="text-left px-4 py-3">Customer</th>
                                    <th className="text-right px-4 py-3">Total</th>
                                    <th className="text-right px-4 py-3">Paid</th>
                                    <th className="text-right px-4 py-3">Due</th>
                                    <th className="text-left px-4 py-3">Method</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sales.map((s) => (
                                    <tr key={s._id} className="border-t border-gray-100">
                                        <td className="px-4 py-3 font-medium">#{s.localId}</td>
                                        <td className="px-4 py-3 text-gray-600">
                                            {new Date(s.createdAt).toLocaleString("bn-BD")}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">
                                            {s.customerName || "—"}
                                        </td>
                                        <td className="px-4 py-3 text-right font-medium text-teal-700">
                                            ৳ {s.total}
                                        </td>
                                        <td className="px-4 py-3 text-right text-green-600">
                                            ৳ {s.paid}
                                        </td>
                                        <td
                                            className={`px-4 py-3 text-right font-medium ${s.dueAmount > 0
                                                    ? "text-red-600"
                                                    : "text-gray-400"
                                                }`}
                                        >
                                            ৳ {s.dueAmount}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">
                                            {s.paymentMethod}
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