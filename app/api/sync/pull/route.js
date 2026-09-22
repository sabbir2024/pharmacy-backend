import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireActiveUser } from "@/lib/auth";
import Medicine from "@/lib/models/Medicine";
import Sale from "@/lib/models/Sale";
import Customer from "@/lib/models/Customer";

export async function GET(req) {
    try {
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
        const deviceId = searchParams.get("deviceId") || "unknown";

        // since এর পরে যা যা পরিবর্তন
        const filter = since
            ? { updatedAt: { $gt: new Date(since) } }
            : {};

        const [medicines, sales, customers] = await Promise.all([
            Medicine.find(filter).sort({ updatedAt: 1 }).lean(),
            Sale.find(filter).sort({ updatedAt: 1 }).lean(),
            Customer.find(filter).sort({ updatedAt: 1 }).lean(),
        ]);

        console.log(
            `📥 Pull for ${deviceId}: since=${since || "beginning"}, ` +
            `medicines=${medicines.length}, sales=${sales.length}, customers=${customers.length}`
        );

        return NextResponse.json({
            success: true,
            serverTime: new Date().toISOString(),
            counts: {
                medicines: medicines.length,
                sales: sales.length,
                customers: customers.length,
            },
            data: { medicines, sales, customers },
        });
    } catch (err) {
        console.error("Pull error:", err);
        return NextResponse.json(
            { success: false, error: err.message },
            { status: 500 }
        );
    }
}