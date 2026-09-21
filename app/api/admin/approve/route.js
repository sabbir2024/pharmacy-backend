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

        if (!userId) {
            return NextResponse.json(
                { success: false, error: "userId দরকার" },
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

        user.status = "active";
        user.approvedBy = auth.user.email;
        user.approvedAt = new Date();
        user.rejectedReason = "";
        await user.save();

        return NextResponse.json({
            success: true,
            message: `${user.email} approved`,
            user: {
                id: user._id,
                email: user.email,
                status: user.status,
                approvedAt: user.approvedAt,
            },
        });
    } catch (err) {
        return NextResponse.json(
            { success: false, error: err.message },
            { status: 500 }
        );
    }
}