import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireActiveUser } from "@/lib/auth";
import Medicine from "@/lib/models/Medicine";
import Sale from "@/lib/models/Sale";
import Customer from "@/lib/models/Customer";

export async function GET(req) {
    try {
        // 🆕 শুধু active user pull করতে পারবে
        const auth = requireActiveUser(req);
        if (auth.error) {
            return NextResponse.json(
                {
                    success: false,
                    error: auth.error,
                    userStatus: auth.userStatus,
                },
                { status: auth.status }
            );
        }

        await connectDB();

        const { searchParams } = new URL(req.url);
        const since = searchParams.get("since");

        const filter = since
            ? { updatedAt: { $gt: new Date(since) } }
            : {};

        const [medicines, sales, customers] = await Promise.all([
            Medicine.find(filter).lean(),
            Sale.find(filter).lean(),
            Customer.find(filter).lean(),
        ]);

        return NextResponse.json({
            success: true,
            serverTime: new Date().toISOString(),
            data: { medicines, sales, customers },
        });
    } catch (err) {
        return NextResponse.json(
            { success: false, error: err.message },
            { status: 500 }
        );
    }
}