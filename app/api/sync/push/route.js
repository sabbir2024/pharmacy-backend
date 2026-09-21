import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireActiveUser } from "@/lib/auth";
import Medicine from "@/lib/models/Medicine";
import Sale from "@/lib/models/Sale";
import Customer from "@/lib/models/Customer";

export async function POST(req) {
    try {
        // 🆕 শুধু active user push করতে পারবে
        const auth = requireActiveUser(req);
        if (auth.error) {
            return NextResponse.json(
                {
                    success: false,
                    error: auth.error,
                    userStatus: auth.userStatus,
                },
                { status: auth.status }
            );
        }

        await connectDB();
        const body = await req.json();
        const { medicines = [], sales = [], customers = [] } = body;

        const results = { medicines: 0, sales: 0, customers: 0 };

        for (const m of medicines) {
            if (!m.id) continue;
            await Medicine.findOneAndUpdate(
                { localId: m.id, deviceId: m.deviceId || "default" },
                { ...m, localId: m.id, updatedAt: new Date() },
                { upsert: true, new: true }
            );
            results.medicines++;
        }

        for (const s of sales) {
            if (!s.id) continue;
            await Sale.findOneAndUpdate(
                { localId: s.id, deviceId: s.deviceId || "default" },
                { ...s, localId: s.id, updatedAt: new Date() },
                { upsert: true, new: true }
            );
            results.sales++;
        }

        for (const c of customers) {
            if (!c.id) continue;
            await Customer.findOneAndUpdate(
                { localId: c.id, deviceId: c.deviceId || "default" },
                { ...c, localId: c.id, updatedAt: new Date() },
                { upsert: true, new: true }
            );
            results.customers++;
        }

        return NextResponse.json({ success: true, synced: results });
    } catch (err) {
        return NextResponse.json(
            { success: false, error: err.message },
            { status: 500 }
        );
    }
}