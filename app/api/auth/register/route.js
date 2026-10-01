import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/lib/models/User";
import { generateToken } from "@/lib/auth";

export async function POST(req) {
    try {
        await connectDB();
        const body = await req.json();

        const {
            email,
            password,
            name,
            shopName,
            address,
            phone,
        } = body;

        // Validation
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

        // Existing check
        const existing = await User.findOne({ email });
        if (existing) {
            return NextResponse.json(
                { success: false, error: "এই email আগে থেকেই আছে" },
                { status: 400 }
            );
        }

        // Hash password
        const hashed = await bcrypt.hash(password, 10);

        // ✅ প্রথম user = admin
        const userCount = await User.countDocuments();
        const isFirstUser = userCount === 0;

        const user = await User.create({
            email,
            password: hashed,
            name: name || "",
            shopName: shopName || "",
            address: address || "",
            phone: phone || "",
            businessType: "pharmacy",
            role: isFirstUser ? "admin" : "user",
            status: isFirstUser ? "active" : "pending",
        });

        console.log(
            `✅ User created: ${user.email} | role: ${user.role} | status: ${user.status}`
        );

        // ✅ Pending user → token দেব না
        if (user.status === "pending") {
            return NextResponse.json({
                success: true,
                pending: true,
                message:
                    "আপনার অ্যাকাউন্ট তৈরি হয়েছে। Admin approve করলে login করতে পারবেন।",
                user: {
                    id: user._id.toString(),
                    email: user.email,
                    name: user.name,
                    shopName: user.shopName,
                    role: user.role,
                    status: user.status,
                },
            });
        }

        // ✅ Active user (first admin) → token দাও
        const token = generateToken(user);

        return NextResponse.json({
            success: true,
            token,
            user: {
                id: user._id.toString(),
                email: user.email,
                name: user.name,
                shopName: user.shopName,
                address: user.address || "",
                phone: user.phone || "",
                businessType: user.businessType || "pharmacy",
                role: user.role,
                status: user.status,
            },
        });
    } catch (err) {
        console.error("❌ Register error:", err);
        return NextResponse.json(
            { success: false, error: err.message },
            { status: 500 }
        );
    }
}