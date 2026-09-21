"use client";

import { useEffect, useState } from "react";

export default function AdminProducts() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [lowOnly, setLowOnly] = useState(false);
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
            const url = `/api/admin/products?q=${encodeURIComponent(
                search
            )}${lowOnly ? "&low=1" : ""}`;
            const res = await fetch(url, {
                headers: { Authorization: `Bearer ${token()}` },
            });
            const json = await res.json();
            if (json.success) setProducts(json.products);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const t = setTimeout(load, 300);
        return () => clearTimeout(t);
    }, [search, lowOnly]);

    const openNew = () => {
        setEditing({
            name: "",
            company: "",
            price: 0,
            stock: 0,
            unit: "pcs",
            costPrice: 0,
            expiry: "",
            barcode: "",
            pcsPerUnit: 1,
        });
        setShowModal(true);
    };

    const openEdit = (p) => {
        setEditing({ ...p });
        setShowModal(true);
    };

    const save = async () => {
        setSaving(true);
        try {
            const isNew = !editing._id;
            const url = isNew
                ? "/api/admin/products"
                : `/api/admin/products/${editing._id}`;

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
            } else {
                alert("❌ " + json.error);
            }
        } catch (err) {
            alert("Error: " + err.message);
        } finally {
            setSaving(false);
        }
    };

    const remove = async (id, name) => {
        if (!confirm(`"${name}" মুছে ফেলবেন?`)) return;
        const res = await fetch(`/api/admin/products/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token()}` },
        });
        const json = await res.json();
        if (json.success) load();
        else alert("❌ " + json.error);
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Products</h1>
                    <p className="text-sm text-gray-500">
                        {products.length}টি ঔষধ
                    </p>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={openNew}
                        className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700"
                    >
                        + নতুন ঔষধ
                    </button>
                    <a
                        href="/api/admin/products/template"
                        className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
                    >
                        📄 Template
                    </a>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-4">
                <input
                    placeholder="নাম / কোম্পানি / বারকোড সার্চ..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 min-w-[200px] border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-500"
                />
                <label className="flex items-center gap-2 text-sm bg-white border border-gray-300 rounded-lg px-3 py-2">
                    <input
                        type="checkbox"
                        checked={lowOnly}
                        onChange={(e) => setLowOnly(e.target.checked)}
                    />
                    কম স্টক
                </label>
            </div>

            {/* Table */}
            {loading ? (
                <div className="text-center py-16 text-gray-500">Loading...</div>
            ) : products.length === 0 ? (
                <div className="text-center py-16 text-gray-500">
                    কোনো ঔষধ নেই
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-gray-700">
                                <tr>
                                    <th className="text-left px-4 py-3">Name</th>
                                    <th className="text-left px-4 py-3">Company</th>
                                    <th className="text-right px-4 py-3">Price</th>
                                    <th className="text-right px-4 py-3">Stock</th>
                                    <th className="text-left px-4 py-3">Unit</th>
                                    <th className="text-left px-4 py-3">Expiry</th>
                                    <th className="text-right px-4 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((p) => (
                                    <tr key={p._id} className="border-t border-gray-100">
                                        <td className="px-4 py-3 font-medium text-gray-900">
                                            {p.name}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">
                                            {p.company || "—"}
                                        </td>
                                        <td className="px-4 py-3 text-right text-teal-700 font-medium">
                                            ৳ {p.price}
                                        </td>
                                        <td
                                            className={`px-4 py-3 text-right font-medium ${p.stock <= 10 ? "text-red-600" : "text-gray-900"
                                                }`}
                                        >
                                            {p.stock}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">{p.unit}</td>
                                        <td className="px-4 py-3 text-gray-600">
                                            {p.expiry || "—"}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button
                                                onClick={() => openEdit(p)}
                                                className="text-blue-600 hover:underline mr-3"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => remove(p._id, p.name)}
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

            {/* Modal */}
            {showModal && editing && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-lg font-bold mb-4">
                            {editing._id ? "ঔষধ এডিট" : "নতুন ঔষধ"}
                        </h2>

                        <div className="grid grid-cols-2 gap-3">
                            <Field label="নাম *">
                                <input
                                    className="input"
                                    value={editing.name}
                                    onChange={(e) =>
                                        setEditing({ ...editing, name: e.target.value })
                                    }
                                />
                            </Field>
                            <Field label="কোম্পানি">
                                <input
                                    className="input"
                                    value={editing.company}
                                    onChange={(e) =>
                                        setEditing({ ...editing, company: e.target.value })
                                    }
                                />
                            </Field>
                            <Field label="বিক্রয়মূল্য">
                                <input
                                    type="number"
                                    className="input"
                                    value={editing.price}
                                    onChange={(e) =>
                                        setEditing({ ...editing, price: e.target.value })
                                    }
                                />
                            </Field>
                            <Field label="ক্রয়মূল্য">
                                <input
                                    type="number"
                                    className="input"
                                    value={editing.costPrice}
                                    onChange={(e) =>
                                        setEditing({ ...editing, costPrice: e.target.value })
                                    }
                                />
                            </Field>
                            <Field label="স্টক">
                                <input
                                    type="number"
                                    className="input"
                                    value={editing.stock}
                                    onChange={(e) =>
                                        setEditing({ ...editing, stock: e.target.value })
                                    }
                                />
                            </Field>
                            <Field label="ইউনিট">
                                <select
                                    className="input"
                                    value={editing.unit}
                                    onChange={(e) =>
                                        setEditing({ ...editing, unit: e.target.value })
                                    }
                                >
                                    <option value="pcs">pcs</option>
                                    <option value="box">box</option>
                                    <option value="set">set</option>
                                    <option value="strip">strip</option>
                                    <option value="bottle">bottle</option>
                                </select>
                            </Field>
                            <Field label="প্রতি ইউনিটে pcs">
                                <input
                                    type="number"
                                    className="input"
                                    value={editing.pcsPerUnit}
                                    onChange={(e) =>
                                        setEditing({ ...editing, pcsPerUnit: e.target.value })
                                    }
                                />
                            </Field>
                            <Field label="এক্সপায়ারি">
                                <input
                                    className="input"
                                    placeholder="YYYY-MM-DD"
                                    value={editing.expiry}
                                    onChange={(e) =>
                                        setEditing({ ...editing, expiry: e.target.value })
                                    }
                                />
                            </Field>
                            <div className="col-span-2">
                                <Field label="বারকোড">
                                    <input
                                        className="input"
                                        value={editing.barcode}
                                        onChange={(e) =>
                                            setEditing({ ...editing, barcode: e.target.value })
                                        }
                                    />
                                </Field>
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
                                className="flex-1 py-2.5 rounded-lg bg-teal-600 text-white font-medium disabled:opacity-50"
                            >
                                {saving ? "সেভ হচ্ছে..." : "সেভ"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
        .input {
          width: 100%;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          padding: 8px 12px;
          font-size: 14px;
          outline: none;
        }
        .input:focus {
          border-color: #0d9488;
        }
      `}</style>
        </div>
    );
}

function Field({ label, children }) {
    return (
        <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
                {label}
            </label>
            {children}
        </div>
    );
}