import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/lib/models/User";

export async function POST(req) {
    try {
        await connectDB();
        const { email, password, name, shopName } = await req.json();

        if (!email || !password) {
            return NextResponse.json(
                { success: false, error: "Email ও password দরকার" },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { success: false, error: "Password কমপক্ষে ৬ অক্ষর" },
                { status: 400 }
            );
        }

        const existing = await User.findOne({ email });
        if (existing) {
            return NextResponse.json(
                { success: false, error: "এই email আগে থেকেই আছে" },
                { status: 400 }
            );
        }

        const hashed = await bcrypt.hash(password, 10);

        // 🆕 প্রথম user হলে admin, না হলে pending user
        const userCount = await User.countDocuments();
        const isFirstUser = userCount === 0;

        const user = await User.create({
            email,
            password: hashed,
            name: name || "",
            shopName: shopName || "",
            role: isFirstUser ? "admin" : "user",
            status: isFirstUser ? "active" : "pending",
        });

        // 🆕 Token শুধু admin হলে বা active হলে দেব
        // Pending user কে token দেব না
        if (user.status === "pending") {
            return NextResponse.json({
                success: true,
                pending: true,
                message:
                    "আপনার অ্যাকাউন্ট তৈরি হয়েছে। Admin approve করলে আপনি login করতে পারবেন।",
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    status: user.status,
                },
            });
        }

        // Admin (first user) — token দাও
        const { generateToken } = await import("@/lib/auth");
        const token = generateToken(user);

        return NextResponse.json({
            success: true,
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                shopName: user.shopName,
                role: user.role,
                status: user.status,
            },
        });
    } catch (err) {
        console.error("Register error:", err);
        return NextResponse.json(
            { success: false, error: err.message },
            { status: 500 }
        );
    }
}