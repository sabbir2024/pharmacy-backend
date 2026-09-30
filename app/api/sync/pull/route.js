import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireActiveUser } from "@/lib/auth";
import User from "@/lib/models/User";
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

        const userId = auth.user.id;
        const { searchParams } = new URL(req.url);
        const since = searchParams.get("since");
        const deviceId = searchParams.get("deviceId") || "unknown";

        // ✅ Own profile
        const user = await User.findById(userId).select("-password").lean();

        const profile = user
            ? {
                userId: user._id.toString(),
                email: user.email,
                name: user.name || "",
                shopName: user.shopName || "",
                address: user.address || "",
                phone: user.phone || "",
                businessType: user.businessType || "pharmacy",
                role: user.role,
                status: user.status,
                updatedAt: (user.updatedAt || user.createdAt).toISOString(),
            }
            : null;

        // Filter (userId + since)
        const baseFilter = { userId };
        const dateFilter = since
            ? { updatedAt: { $gt: new Date(since) } }
            : {};

        const filter = { ...baseFilter, ...dateFilter };

        const [medicines, sales, customers] = await Promise.all([
            Medicine.find(filter).sort({ updatedAt: 1 }).lean(),
            Sale.find(filter).sort({ updatedAt: 1 }).lean(),
            Customer.find(filter).sort({ updatedAt: 1 }).lean(),
        ]);

        console.log(
            `📥 Pull for ${deviceId}: profile=${!!profile}, med=${medicines.length}, sales=${sales.length}, cust=${customers.length}`
        );

        return NextResponse.json({
            success: true,
            serverTime: new Date().toISOString(),
            counts: {
                profile: profile ? 1 : 0,
                medicines: medicines.length,
                sales: sales.length,
                customers: customers.length,
            },
            data: {
                profile,
                medicines,
                sales,
                customers,
            },
        });
    } catch (err) {
        console.error("❌ Pull error:", err);
        return NextResponse.json(
            { success: false, error: err.message },
            { status: 500 }
        );
    }
}