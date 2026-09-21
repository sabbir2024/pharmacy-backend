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
        const { userId } = await req.json();

        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json(
                { success: false, error: "User পাওয়া যায়নি" },
                { status: 404 }
            );
        }

        // নিজেকে block করতে পারবে না
        if (user.email === auth.user.email) {
            return NextResponse.json(
                { success: false, error: "নিজেকে block করা যাবে না" },
                { status: 400 }
            );
        }

        // Admin কে block করা যাবে না
        if (user.role === "admin") {
            return NextResponse.json(
                { success: false, error: "Admin কে block করা যাবে না" },
                { status: 400 }
            );
        }

        user.status = "blocked";
        await user.save();

        return NextResponse.json({
            success: true,
            message: `${user.email} blocked`,
        });
    } catch (err) {
        return NextResponse.json(
            { success: false, error: err.message },
            { status: 500 }
        );
    }
}