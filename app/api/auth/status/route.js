import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/lib/models/User";

// Email দিয়ে status চেক (login ছাড়াই)
export async function GET(req) {
    try {
        await connectDB();

        const { searchParams } = new URL(req.url);
        const email = searchParams.get("email");

        if (!email) {
            return NextResponse.json(
                { success: false, error: "email দরকার" },
                { status: 400 }
            );
        }

        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.json(
                { success: false, error: "User পাওয়া যায়নি" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            status: user.status,
            email: user.email,
            name: user.name,
        });
    } catch (err) {
        return NextResponse.json(
            { success: false, error: err.message },
            { status: 500 }
        );
    }
}