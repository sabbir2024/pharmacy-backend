import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/auth";
import User from "@/lib/models/User";

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
        const { userId, role } = await req.json();

        if (!userId) {
            return NextResponse.json(
                { success: false, error: "userId দরকার" },
                { status: 400 }
            );
        }

        if (!["admin", "user"].includes(role)) {
            return NextResponse.json(
                { success: false, error: "role হবে 'admin' বা 'user'" },
                { status: 400 }
            );
        }

        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json(
                { success: false, error: "User পাওয়া যায়নি" },
                { status: 404 }
            );
        }

        // নিজের role পরিবর্তন করতে পারবে না
        if (user.email === auth.user.email) {
            return NextResponse.json(
                { success: false, error: "নিজের role পরিবর্তন করা যাবে না" },
                { status: 400 }
            );
        }

        // শেষ admin কে demote করা যাবে না
        if (user.role === "admin" && role === "user") {
            const adminCount = await User.countDocuments({ role: "admin" });
            if (adminCount <= 1) {
                return NextResponse.json(
                    {
                        success: false,
                        error: "শেষ admin কে demote করা যাবে না",
                    },
                    { status: 400 }
                );
            }
        }

        user.role = role;

        // Admin বানালে active করে দাও
        if (role === "admin" && user.status !== "active") {
            user.status = "active";
            user.approvedBy = auth.user.email;
            user.approvedAt = new Date();
        }

        await user.save();

        return NextResponse.json({
            success: true,
            message: `${user.email} → ${role}`,
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                status: user.status,
            },
        });
    } catch (err) {
        return NextResponse.json(
            { success: false, error: err.message },
            { status: 500 }
        );
    }
}