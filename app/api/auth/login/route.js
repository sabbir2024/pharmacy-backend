import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/lib/models/User";
import { generateToken } from "@/lib/auth";

export async function POST(req) {
    try {
        await connectDB();

        const { email, password } = await req.json();

        // ============================
        // ১. Input যাচাই
        // ============================
        if (!email || !password) {
            return NextResponse.json(
                { success: false, error: "Email ও password দরকার" },
                { status: 400 }
            );
        }

        // ============================
        // ২. User খুঁজুন
        // ============================
        const user = await User.findOne({ email: email.trim() });
        if (!user) {
            return NextResponse.json(
                { success: false, error: "User পাওয়া যায়নি" },
                { status: 401 }
            );
        }

        // ============================
        // ৩. Password যাচাই
        // ============================
        const ok = await bcrypt.compare(password, user.password);
        if (!ok) {
            return NextResponse.json(
                { success: false, error: "Password ভুল" },
                { status: 401 }
            );
        }

        // ============================
        // ৪. Status চেক
        // ============================
        if (user.status === "pending") {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "আপনার অ্যাকাউন্ট এখনো admin approve করেনি। অনুগ্রহ করে অপেক্ষা করুন।",
                    userStatus: "pending",
                },
                { status: 403 }
            );
        }

        if (user.status === "rejected") {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "আপনার অ্যাকাউন্ট admin reject করেছে। যোগাযোগ করুন।",
                    userStatus: "rejected",
                },
                { status: 403 }
            );
        }

        if (user.status === "blocked") {
            return NextResponse.json(
                {
                    success: false,
                    error: "আপনার অ্যাকাউন্ট block করা হয়েছে।",
                    userStatus: "blocked",
                },
                { status: 403 }
            );
        }

        // ============================
        // ৫. Login সফল
        // ============================
        user.lastLoginAt = new Date();
        await user.save();

        const token = generateToken(user);



        // ✅ role + status সহ response
        return NextResponse.json({
            success: true,
            token,
            user: {
                id: user._id.toString(),
                email: user.email,
                name: user.name || "",
                shopName: user.shopName || "",
                role: user.role || "user",       // 👈 এটা দরকার
                status: user.status || "active", // 👈 এটা দরকার
            },
        });
    } catch (err) {
        console.error("Login error:", err);
        return NextResponse.json(
            { success: false, error: err.message || "Login failed" },
            { status: 500 }
        );
    }
}