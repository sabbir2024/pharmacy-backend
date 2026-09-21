import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/auth";
import Sale from "@/lib/models/Sale";

export async function GET(req) {
    try {
        const auth = requireAdmin(req);
        if (auth.error) {
            return NextResponse.json(
                { success: false, error: auth.error },
                { status: auth.status }
            );
        }

        await connectDB();

        const sales = await Sale.find({ deleted: { $ne: true } })
            .sort({ createdAt: -1 })
            .limit(200)
            .lean();

        return NextResponse.json({ success: true, sales });
    } catch (err) {
        return NextResponse.json(
            { success: false, error: err.message },
            { status: 500 }
        );
    }
}