"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const NAV_ITEMS = [
    { href: "/admin", label: "Dashboard", icon: "📊" },
    { href: "/admin/users", label: "Users", icon: "👥" },
    { href: "/admin/products", label: "Products", icon: "💊" },
    { href: "/admin/customers", label: "Due Customers", icon: "🧾" },
    { href: "/admin/sales", label: "Sales", icon: "🛒" },
    { href: "/admin/sync", label: "Sync Status", icon: "☁️" },
];

export default function AdminLayout({ children }) {
    const pathname = usePathname();
    const router = useRouter();
    const [ready, setReady] = useState(false);

    useEffect(() => {
        // Login page এ sidebar দেখাবে না
        if (pathname === "/admin/login") {
            setReady(true);
            return;
        }

        const token = localStorage.getItem("admin_token");
        if (!token) {
            router.push("/admin/login");
            return;
        }

        setReady(true);
    }, [pathname, router]);

    // Login page এ full width
    if (pathname === "/admin/login") {
        return <>{children}</>;
    }

    if (!ready) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-gray-500">Loading...</div>
            </div>
        );
    }

    const logout = () => {
        localStorage.removeItem("admin_token");
        router.push("/admin/login");
    };

    return (
        <div className="min-h-screen flex bg-gray-50">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
                {/* Logo */}
                <div className="px-6 py-5 border-b border-gray-100">
                    <h1 className="text-lg font-bold text-teal-700">Pharmacy POS</h1>
                    <p className="text-xs text-gray-500">Admin Panel</p>
                </div>

                {/* Nav */}
                <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                    {NAV_ITEMS.map((item) => {
                        const active =
                            item.href === "/admin"
                                ? pathname === "/admin"
                                : pathname.startsWith(item.href);

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${active
                                        ? "bg-teal-50 text-teal-700"
                                        : "text-gray-700 hover:bg-gray-100"
                                    }`}
                            >
                                <span>{item.icon}</span>
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Logout */}
                <div className="p-3 border-t border-gray-100">
                    <button
                        onClick={logout}
                        className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
                    >
                        <span>🚪</span>
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main */}
            <main className="flex-1 overflow-x-auto">{children}</main>
        </div>
    );
}