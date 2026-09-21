import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/auth";
import User from "@/lib/models/User";
import Medicine from "@/lib/models/Medicine";
import Sale from "@/lib/models/Sale";
import Customer from "@/lib/models/Customer";

export async function GET(req) {
    try {
        const auth = requireAdmin(req);
        if (auth.error) {
            return NextResponse.json(
                { success: false, error: auth.error },
                { status: auth.status }
            );
        }

        await connectDB();

        const [
            usersTotal,
            usersPending,
            usersActive,
            medsTotal,
            medsLow,
            salesAgg,
            custAgg,
        ] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ status: "pending" }),
            User.countDocuments({ status: "active" }),
            Medicine.countDocuments({ deleted: false }),
            Medicine.countDocuments({ deleted: false, stock: { $lte: 10 } }),
            Sale.aggregate([
                { $match: { deleted: false } },
                {
                    $group: {
                        _id: null,
                        count: { $sum: 1 },
                        revenue: { $sum: "$total" },
                    },
                },
            ]),
            Customer.aggregate([
                { $match: { deleted: false } },
                {
                    $group: {
                        _id: null,
                        count: { $sum: 1 },
                        totalDue: { $sum: "$totalDue" },
                    },
                },
            ]),
        ]);

        return NextResponse.json({
            success: true,
            users: {
                total: usersTotal,
                pending: usersPending,
                active: usersActive,
            },
            medicines: {
                total: medsTotal,
                lowStock: medsLow,
            },
            sales: {
                total: salesAgg[0]?.count ?? 0,
                revenue: salesAgg[0]?.revenue ?? 0,
            },
            customers: {
                total: custAgg[0]?.count ?? 0,
                totalDue: custAgg[0]?.totalDue ?? 0,
            },
        });
    } catch (err) {
        return NextResponse.json(
            { success: false, error: err.message },
            { status: 500 }
        );
    }
}