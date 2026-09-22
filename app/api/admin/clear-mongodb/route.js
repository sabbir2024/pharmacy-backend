import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/auth";
import Medicine from "@/lib/models/Medicine";
import Sale from "@/lib/models/Sale";
import Customer from "@/lib/models/Customer";

export async function POST(req) {
    try {
        const auth = requireAdmin(req);
        if (auth.error) {
            return NextResponse.json(
                { success: false, error: auth.error },
                { status: auth.status }
            );
        }

        await connectDB();

        const body = await req.json().catch(() => ({}));
        const { tables } = body;

        // Default: সব মুছবে (users ছাড়া)
        const targets = tables || ["medicines", "sales", "customers"];

        const results = {};

        if (targets.includes("medicines")) {
            const r = await Medicine.deleteMany({});
            results.medicines = r.deletedCount;
        }

        if (targets.includes("sales")) {
            const r = await Sale.deleteMany({});
            results.sales = r.deletedCount;
        }

        if (targets.includes("customers")) {
            const r = await Customer.deleteMany({});
            results.customers = r.deletedCount;
        }

        return NextResponse.json({
            success: true,
            message: "MongoDB cleared",
            deleted: results,
        });
    } catch (err) {
        return NextResponse.json(
            { success: false, error: err.message },
            { status: 500 }
        );
    }
}