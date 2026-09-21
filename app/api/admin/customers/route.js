import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/auth";
import Customer from "@/lib/models/Customer";

// LIST
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

        const { searchParams } = new URL(req.url);
        const q = searchParams.get("q") || "";

        const filter = { deleted: { $ne: true } };
        if (q) {
            filter.$or = [
                { name: { $regex: q, $options: "i" } },
                { phone: { $regex: q, $options: "i" } },
            ];
        }

        const customers = await Customer.find(filter)
            .sort({ totalDue: -1 })
            .limit(500)
            .lean();

        return NextResponse.json({ success: true, customers });
    } catch (err) {
        return NextResponse.json(
            { success: false, error: err.message },
            { status: 500 }
        );
    }
}

// CREATE
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
        const body = await req.json();

        const created = await Customer.create({
            name: body.name,
            phone: body.phone || "",
            address: body.address || "",
            totalDue: Number(body.totalDue) || 0,
            updatedAt: new Date(),
        });

        return NextResponse.json({ success: true, customer: created });
    } catch (err) {
        return NextResponse.json(
            { success: false, error: err.message },
            { status: 500 }
        );
    }
}