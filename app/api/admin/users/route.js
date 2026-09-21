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
        const status = searchParams.get("status");
        const role = searchParams.get("role");
        const q = searchParams.get("q") || "";

        const filter = {};

        if (status && status !== "all") {
            filter.status = status;
        }

        if (role && role !== "all") {
            filter.role = role;
        }

        if (q) {
            filter.$or = [
                { email: { $regex: q, $options: "i" } },
                { name: { $regex: q, $options: "i" } },
                { shopName: { $regex: q, $options: "i" } },
            ];
        }

        const users = await User.find(filter)
            .select("-password")
            .sort({ createdAt: -1 })
            .lean();

        const counts = {
            all: await User.countDocuments(),
            pending: await User.countDocuments({ status: "pending" }),
            active: await User.countDocuments({ status: "active" }),
            rejected: await User.countDocuments({ status: "rejected" }),
            blocked: await User.countDocuments({ status: "blocked" }),
            admins: await User.countDocuments({ role: "admin" }),
            users: await User.countDocuments({ role: "user" }),
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