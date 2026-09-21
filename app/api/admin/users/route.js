import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/auth";
import User from "@/lib/models/User";

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
        const status = searchParams.get("status"); // pending, active, rejected, blocked

        const filter = status ? { status } : {};

        const users = await User.find(filter)
            .select("-password")
            .sort({ createdAt: -1 })
            .lean();

        // Status counts
        const counts = {
            all: await User.countDocuments(),
            pending: await User.countDocuments({ status: "pending" }),
            active: await User.countDocuments({ status: "active" }),
            rejected: await User.countDocuments({ status: "rejected" }),
            blocked: await User.countDocuments({ status: "blocked" }),
        };

        return NextResponse.json({
            success: true,
            users,
            counts,
        });
    } catch (err) {
        return NextResponse.json(
            { success: false, error: err.message },
            { status: 500 }
        );
    }
}